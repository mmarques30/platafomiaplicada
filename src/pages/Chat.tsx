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

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requisições excedido. Tente novamente mais tarde.");
          return;
        }
        if (response.status === 402) {
          toast.error("Créditos insuficientes. Adicione créditos na sua conta.");
          return;
        }
        throw new Error("Erro ao enviar mensagem");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
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
            // Ignore JSON parse errors for incomplete chunks
          }
        }
      }

      // Salvar mensagens no histórico
      if (user) {
        await supabase.from("chat_messages").insert([
          { user_id: user.id, role: "user", content: userMessage.content },
          { user_id: user.id, role: "assistant", content: assistantMessage },
        ]);
      }
    } catch (error: any) {
      console.error("Erro no chat:", error);
      toast.error(error.message || "Erro ao enviar mensagem");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

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
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
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