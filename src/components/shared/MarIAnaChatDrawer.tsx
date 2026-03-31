import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Maximize2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMentoriaContext } from "@/hooks/useMentoriaContext";
import mariAvatar from "@/assets/mariana-avatar.png";
import mariAvatarFallback from "@/assets/mari-avatar.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MarIAnaChatDrawerProps {
  onClose: () => void;
}

export function MarIAnaChatDrawer({ onClose }: MarIAnaChatDrawerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMentoriaPage = pathname.startsWith("/mentoria");
  const { contextText, proactiveMessage } = useMentoriaContext({ enabled: isMentoriaPage });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat history on mount
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(50);
        if (error) throw error;
        if (data && data.length > 0) {
          setMessages(data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
        }
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isStreaming ? "smooth" : "auto",
      });
    }
  }, [messages, isStreaming]);

  const sendMessage = async (messageToSend: string) => {
    if (!messageToSend.trim() || !user) return;

    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, 120000);

    setIsLoading(true);
    setIsStreaming(false);
    setInput("");

    const userMessage: Message = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const messagesToSend = [...messages, userMessage];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: messagesToSend.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) throw new Error("Você atingiu o limite de requisições. Aguarde um momento.");
        if (response.status === 402) throw new Error("Créditos insuficientes.");
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                assistantContent += content;

                if (!isStreaming) {
                  setIsLoading(false);
                  setIsStreaming(true);
                }

                flushSync(() => {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1]?.role === "assistant") {
                      newMessages[newMessages.length - 1].content = assistantContent;
                    } else {
                      newMessages.push({ role: "assistant", content: assistantContent });
                    }
                    return newMessages;
                  });
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Flush remaining buffer
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                flushSync(() => {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1]?.role === "assistant") {
                      newMessages[newMessages.length - 1].content = assistantContent;
                    } else {
                      newMessages.push({ role: "assistant", content: assistantContent });
                    }
                    return newMessages;
                  });
                });
              }
            } catch {
              // ignore
            }
          }
        }
      }

      // Save only the 2 new messages
      if (assistantContent) {
        await supabase.from("chat_messages").insert([
          { user_id: user.id, role: "user", content: messageToSend },
          { user_id: user.id, role: "assistant", content: assistantContent },
        ]);
      }

      setIsStreaming(false);
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => prev.slice(0, -1));

      if (error.name === "AbortError") {
        toast.error("Requisição cancelada por timeout.");
      } else if (error.message.includes("Failed to fetch")) {
        toast.error("Erro de conexão. Verifique sua internet.");
      } else {
        toast.error(error.message || "Erro ao enviar mensagem.");
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isStreaming) {
      sendMessage(input);
    }
  };

  const handleOpenFullChat = () => {
    navigate("/chat", { state: { initialMessages: messages } });
    onClose();
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-[380px] h-[500px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/50">
        <img
          src={mariAvatar}
          alt="MarIAna"
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => { e.currentTarget.src = mariAvatarFallback; }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-tight">
            Mar<span className="text-primary">IA</span>na
          </h3>
          <p className="text-xs text-muted-foreground">Sua mentora de IA</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMessages([])} title="Nova conversa">
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenFullChat} title="Abrir chat completo">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoadingHistory ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 1 ? "justify-end" : "justify-start"}`}>
                <Skeleton className={`h-10 rounded-lg ${i % 2 === 1 ? "w-3/4" : "w-2/3"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <img
              src={mariAvatar}
              alt="MarIAna"
              className="w-12 h-12 rounded-full mb-2 object-cover"
              onError={(e) => { e.currentTarget.src = mariAvatarFallback; }}
            />
            <p className="text-sm font-medium">
              Sou a Mar<span className="text-primary">IA</span>na
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Qual sua dúvida hoje?
            </p>
            <div className="w-full space-y-2 px-1">
              {[
                "Qual meu próximo passo na mentoria?",
                "Como usar IA para automatizar tarefas?",
                "Me sugira uma trilha de aprendizado",
                "Quais ferramentas de IA devo começar?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading || isStreaming}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors text-foreground/80 hover:text-foreground disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-2 items-start max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {message.role === "assistant" && (
                <img
                  src={mariAvatar}
                  alt="MarIAna"
                  className="w-7 h-7 rounded-full flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = mariAvatarFallback; }}
                />
              )}
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="flex items-start gap-1">
                    <div className="prose prose-xs dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => {
                            if (href?.startsWith("/")) {
                              return (
                                <a
                                  href={href}
                                  className="text-primary underline hover:text-primary/80 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(href);
                                    onClose();
                                  }}
                                >
                                  {children}
                                </a>
                              );
                            }
                            return (
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {isStreaming && index === messages.length - 1 && (
                      <span className="text-primary ml-1 animate-pulse">▌</span>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-start">
              <img
                src={mariAvatar}
                alt="MarIAna"
                className="w-7 h-7 rounded-full flex-shrink-0"
                onError={(e) => { e.currentTarget.src = mariAvatarFallback; }}
              />
              <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block w-2 h-2 rounded-full bg-muted-foreground"
                    style={{
                      animation: 'pulse-dot 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Digite sua mensagem..."
            className="min-h-[36px] max-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 py-2 text-sm rounded-lg"
            disabled={isLoading || isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || isStreaming || !input.trim()}
            className="flex-shrink-0 rounded-full h-9 w-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
