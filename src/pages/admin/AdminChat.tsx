import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, MessageSquare, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AdminChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Oi! 👋 Sou a Mari e aqui você tem poderes especiais! 🔧✨\n\nComo admin, posso te ajudar a criar conteúdo diretamente no banco de dados. É só me pedir!\n\n**O que posso criar pra você:**\n\n🛤️ **Trilhas** - ex: \"Cria uma trilha sobre IA para Marketing, nível iniciante\"\n\n📦 **Módulos** - ex: \"Adiciona um módulo sobre ChatGPT na trilha X\"\n\n🎥 **Vídeos** - ex: \"Cria um vídeo sobre prompts no módulo Y\"\n\n🤖 **Ferramentas IA** - ex: \"Adiciona o Claude à biblioteca de ferramentas\"\n\n💬 **Prompts** - ex: \"Cria um prompt para análise de dados\"\n\n📝 **Métodos** - ex: \"Adiciona um método sobre storytelling com IA\"\n\n✨ **IA Copie e Use** - ex: \"Cria um template de email com IA\"\n\n🎯 **Objetivos para Mentorados** - ex: \"Cria objetivo para o mentorado João\"\n\n📚 **Recursos para Mentorados** - ex: \"Adiciona recurso sobre automação para Maria\"\n\n---\n\n**Como funciona:**\n1. Você me pede pra criar algo\n2. Eu confirmo os dados com você\n3. Você aprova\n4. Eu crio no banco de dados\n\nVamos começar? 🚀"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 120000);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
          signal: abortControllerRef.current.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error("Limite de requisições atingido. Aguarde um momento.");
        } else if (response.status === 402) {
          throw new Error("Créditos insuficientes. Entre em contato com suporte.");
        } else if (response.status === 403) {
          throw new Error("Você não tem permissão de administrador.");
        }
        
        throw new Error(errorData.error || `Erro: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Não foi possível ler a resposta");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
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
              console.error("Erro ao parsear chunk:", e);
            }
          }
        }
      }

    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      
      if (error.name === "AbortError") {
        toast({
          title: "Tempo esgotado",
          description: "A requisição demorou muito. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: error.message || "Erro ao processar mensagem",
          variant: "destructive",
        });
      }

      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chat Administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Crie conteúdo conversando com a Mari - poderes especiais ativados!
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-card p-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-card p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem ou peça para criar conteúdo..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
