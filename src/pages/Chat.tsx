import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mariAvatar from "@/assets/mari-avatar.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const { user, session } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle initial message from Dashboard
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && messages.length === 0) {
      setInput(initialMessage);
    }
  }, [location.state?.initialMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!session) {
      toast.error("Você precisa estar autenticado para usar o chat");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Set timeout (60 seconds)
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        toast.error("Tempo limite excedido. Tente novamente.");
      }
    }, 60000);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast.error("Limite de requisições excedido. Aguarde alguns minutos e tente novamente.");
          setMessages((prev) => prev.slice(0, -1));
          return;
        }
        if (response.status === 402) {
          toast.error("Créditos insuficientes. Entre em contato com o suporte.");
          setMessages((prev) => prev.slice(0, -1));
          return;
        }
        throw new Error("Erro ao enviar mensagem");
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantContent = '';

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save to history (non-blocking)
      if (user && assistantContent) {
        try {
          await supabase.from("chat_messages").insert([
            { user_id: user.id, role: "user", content: userMessage.content },
            { user_id: user.id, role: "assistant", content: assistantContent },
          ]);
        } catch (error) {
          console.error("Erro ao salvar histórico:", error);
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log("Request aborted");
        return;
      }
      console.error("Erro no chat:", error);
      toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <img 
            src={mariAvatar} 
            alt="Mariana Martins" 
            className="w-16 h-16 rounded-full border-2 border-primary object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4">Chat com a Mari</h1>
        <p className="text-muted-foreground mb-6">
          Faça login para conversar diretamente com a Mariana sobre sua jornada em IA
        </p>
        <Button onClick={() => window.location.href = '/auth'}>
          Fazer Login
        </Button>
      </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container py-6 flex flex-col">
        <div className="mb-4">
        <h1 className="text-2xl font-bold">Chat com a Mari</h1>
        <p className="text-muted-foreground">
          Converse diretamente com a Mariana sobre sua jornada em IA
        </p>
        </div>

        <Card className="flex-1 flex flex-col">
          {/* Header fixo */}
          <div className="p-4 border-b flex items-center gap-3 bg-card">
            <div className="relative">
              <img 
                src={mariAvatar} 
                alt="Mariana Martins" 
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Mariana Martins</h2>
              <p className="text-sm text-muted-foreground">Mentora IA Aplicada</p>
            </div>
          </div>
          
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <img 
                    src={mariAvatar} 
                    alt="Mariana Martins" 
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-2">Oi, Aplicado! 👋</h3>
                  <p className="text-muted-foreground">
                    Sou a Mari, sua mentora de IA. Como posso te ajudar hoje?
                  </p>
                </div>
              )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="flex gap-3 items-start max-w-[80%]">
                  <div className="flex-shrink-0">
                    <img 
                      src={mariAvatar} 
                      alt="Mariana Martins" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">Mari</span>
                      <span className="text-xs text-muted-foreground">Mentora IA Aplicada</span>
                    </div>
                    <div className="ai-message-container">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-[80%]">
                  {message.content}
                </div>
              )}
            </div>
          ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}