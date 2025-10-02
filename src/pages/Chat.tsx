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

      if (!response.ok) {
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

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      // Token-by-token streaming with buffer
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
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush of remaining buffer
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
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch {
            // Ignore partial leftovers
          }
        }
      }

      // Save to history (non-blocking)
      if (user && assistantMessage) {
        try {
          await supabase.from("chat_messages").insert([
            { user_id: user.id, role: "user", content: userMessage.content },
            { user_id: user.id, role: "assistant", content: assistantMessage },
          ]);
        } catch (error) {
          console.error("Erro ao salvar histórico:", error);
          // Continue anyway, don't remove message from UI
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
          <h1 className="text-2xl font-bold mb-4">Chat com IA</h1>
          <p className="text-muted-foreground mb-6">
            Faça login para conversar com seu mentor especializado em IA
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
          <h1 className="text-2xl font-bold">Chat com IA</h1>
          <p className="text-muted-foreground">
            Converse com um mentor especializado em IA
          </p>
        </div>

        <Card className="flex-1 flex flex-col">
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  Envie uma mensagem para começar a conversa
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground px-4 py-2"
                        : "ai-message-container"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
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