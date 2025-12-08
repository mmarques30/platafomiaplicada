import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mariAvatar from "@/assets/mari-avatar.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (location.state?.initialMessages) {
      setMessages(location.state.initialMessages);
    }
  }, [location.state]);

  useEffect(() => {
    if (scrollRef.current) {
      const behavior = isStreaming ? 'smooth' : 'auto';
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
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
        
        if (response.status === 429) {
          throw new Error("Você atingiu o limite de requisições. Aguarde um momento e tente novamente.");
        }
        
        if (response.status === 402) {
          throw new Error("Créditos insuficientes para processar esta requisição.");
        }
        
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
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

          // Processar linha por linha
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1); // Handle CRLF
            if (line.startsWith(":") || line.trim() === "") continue; // SSE comments
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                assistantContent += content;
                
                // Primeira vez que recebemos conteúdo, ativar streaming
                if (!isStreaming) {
                  setIsLoading(false);
                  setIsStreaming(true);
                }
                
                // Usar flushSync para forçar atualizações progressivas
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
            } catch (e) {
              // Linha incompleta - devolver ao buffer e aguardar mais dados
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Flush final para dados restantes no buffer
        if (textBuffer.trim()) {
          const remainingLines = textBuffer.split("\n");
          for (let raw of remainingLines) {
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
              // Ignorar linhas inválidas restantes
            }
          }
        }
      }

      // Salvar histórico no banco após conclusão
      if (assistantContent) {
        const finalMessages = [...messagesToSend, { role: "assistant" as const, content: assistantContent }];
        
        await Promise.all(
          finalMessages.map((msg) =>
            supabase.from("chat_messages").insert({
              user_id: user.id,
              role: msg.role,
              content: msg.content,
            })
          )
        );
      }
      
      setIsStreaming(false);
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      
      // Remove a mensagem do usuário em caso de erro
      setMessages((prev) => prev.slice(0, -1));
      
      if (error.name === "AbortError") {
        toast.error("A requisição demorou muito e foi cancelada. Tente novamente.", {
          duration: 5000,
        });
      } else if (error.message.includes("limite de requisições")) {
        toast.error(error.message, {
          duration: 6000,
        });
      } else if (error.message.includes("Créditos insuficientes")) {
        toast.error(error.message, {
          duration: 6000,
        });
      } else if (error.message.includes("Failed to fetch")) {
        toast.error(
          "Erro de conexão. Verifique sua internet e tente novamente.",
          {
            duration: 5000,
          }
        );
      } else {
        toast.error(
          error.message || "Erro ao enviar mensagem. Tente novamente.",
          {
            duration: 5000,
          }
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Faça login para conversar</h1>
        <Button onClick={() => navigate("/")}>Ir para Login</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-zinc-800">
        <img
          src={mariAvatar}
          alt="Mari"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h1 className="text-lg font-semibold text-white">MarIAna</h1>
          <p className="text-sm text-zinc-400">
            Sua mentora de IA Aplicada
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
            <img
              src={mariAvatar}
              alt="Mari"
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mb-4 object-cover"
            />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Olá! Sou a MarIAna 🧠</h2>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Sua mentora de IA Aplicada. Estou aqui para te ajudar!
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 items-start max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <img
                      src={mariAvatar}
                      alt="Mari"
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="flex items-start gap-1">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {isStreaming && index === messages.length - 1 && (
                          <span className="inline-flex items-center text-primary ml-1 animate-pulse">
                            ▌
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-start">
                  <img
                    src={mariAvatar}
                    alt="Mari"
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="bg-muted rounded-lg px-4 py-2 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Pensando...
                    </span>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
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
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading || isStreaming}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || isStreaming || !input.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
