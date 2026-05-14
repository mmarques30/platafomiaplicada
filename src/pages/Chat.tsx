import { useState, useRef, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageSquarePlus, History } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import mariAvatar from "@/assets/mari-avatar-new.png";
import mariAvatarFallback from "@/assets/mari-avatar.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

function dateKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(key: string): string {
  const today = todayKey();
  if (key === today) return "Hoje";
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (key === yesterday) return "Ontem";
  const [year, month, day] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const sameYear = new Date().getFullYear() === date.getFullYear();
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface DateGroup {
  date: string;
  count: number;
  preview: string;
  messages: Message[];
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());
  const [historySheetOpen, setHistorySheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /* Carrega histórico persistido em chat_messages no primeiro mount.
     Se a navegação trouxer initialMessages, esses têm prioridade. */
  useEffect(() => {
    if (location.state?.initialMessages) {
      const now = new Date().toISOString();
      setMessages(
        location.state.initialMessages.map((m: { role: "user" | "assistant"; content: string }) => ({
          ...m,
          createdAt: now,
        }))
      );
      setIsLoadingHistory(false);
      return;
    }
    if (!user) {
      setIsLoadingHistory(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("Erro ao carregar histórico do chat:", error);
      } else if (data) {
        const valid = data
          .filter(
            (m): m is { role: "user" | "assistant"; content: string; created_at: string } =>
              (m.role === "user" || m.role === "assistant") && !!m.created_at
          )
          .map((m) => ({ role: m.role, content: m.content, createdAt: m.created_at }));
        setMessages(valid);
        if (valid.length > 0) {
          setSelectedDate(dateKey(valid[valid.length - 1].createdAt));
        }
      }
      setIsLoadingHistory(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, location.state]);

  /* Agrupa mensagens por dia (chave YYYY-MM-DD) na ordem mais recente primeiro.
     Usado pela sidebar de histórico. */
  const dateGroups = useMemo<DateGroup[]>(() => {
    const groupMap = new Map<string, Message[]>();
    for (const m of messages) {
      const key = dateKey(m.createdAt);
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(m);
    }
    return Array.from(groupMap.entries())
      .map(([date, msgs]) => {
        const firstUser = msgs.find((m) => m.role === "user");
        return {
          date,
          count: msgs.length,
          preview: (firstUser?.content ?? msgs[0]?.content ?? "").slice(0, 60),
          messages: msgs,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [messages]);

  const visibleMessages = useMemo(
    () => dateGroups.find((g) => g.date === selectedDate)?.messages ?? [],
    [dateGroups, selectedDate]
  );

  /* Garante que selectedDate é uma data que existe no histórico (ou hoje). */
  useEffect(() => {
    if (dateGroups.length === 0) return;
    if (!dateGroups.find((g) => g.date === selectedDate)) {
      setSelectedDate(dateGroups[0].date);
    }
  }, [dateGroups, selectedDate]);

  useEffect(() => {
    if (scrollRef.current) {
      const behavior = isStreaming ? "smooth" : "auto";
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, [visibleMessages, isStreaming]);

  const sendMessage = async (messageToSend: string) => {
    if (!messageToSend.trim() || !user) return;

    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, 120000);

    setIsLoading(true);
    setIsStreaming(false);
    setInput("");
    setSelectedDate(todayKey()); // nova msg sempre vai pra hoje

    const userMessage: Message = {
      role: "user",
      content: messageToSend,
      createdAt: new Date().toISOString(),
    };
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
                      newMessages.push({
                        role: "assistant",
                        content: assistantContent,
                        createdAt: new Date().toISOString(),
                      });
                    }
                    return newMessages;
                  });
                });
              }
            } catch (e) {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

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
                      newMessages.push({
                        role: "assistant",
                        content: assistantContent,
                        createdAt: new Date().toISOString(),
                      });
                    }
                    return newMessages;
                  });
                });
              }
            } catch {
              /* ignora */
            }
          }
        }
      }

      if (assistantContent) {
        const finalMessages = [
          ...messagesToSend,
          { role: "assistant" as const, content: assistantContent, createdAt: new Date().toISOString() },
        ];

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

      setMessages((prev) => prev.slice(0, -1));

      if (error.name === "AbortError") {
        toast.error("A requisição demorou muito e foi cancelada. Tente novamente.", { duration: 5000 });
      } else if (error.message.includes("limite de requisições")) {
        toast.error(error.message, { duration: 6000 });
      } else if (error.message.includes("Créditos insuficientes")) {
        toast.error(error.message, { duration: 6000 });
      } else if (error.message.includes("Failed to fetch")) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.", { duration: 5000 });
      } else {
        toast.error(error.message || "Erro ao enviar mensagem. Tente novamente.", { duration: 5000 });
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

  const sidebar = (
    <aside className="flex h-full w-full flex-col bg-background md:w-64 md:flex-shrink-0 md:border-r md:border-brand-hairline">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Histórico
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setSelectedDate(todayKey());
            setHistorySheetOpen(false);
            inputRef.current?.focus();
          }}
          title="Nova conversa hoje"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {dateGroups.length === 0 && !isLoadingHistory && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Nenhuma conversa ainda.
          </p>
        )}
        {isLoadingHistory && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {dateGroups.map((g) => (
          <button
            key={g.date}
            onClick={() => {
              setSelectedDate(g.date);
              setHistorySheetOpen(false);
            }}
            className={cn(
              "flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
              selectedDate === g.date
                ? "bg-brand-strong/10 text-foreground"
                : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <span className="text-sm font-medium">{formatDateLabel(g.date)}</span>
            <span className="line-clamp-1 w-full text-xs text-muted-foreground">
              {g.preview || `${g.count} ${g.count === 1 ? "mensagem" : "mensagens"}`}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background">
      {/* Sidebar desktop */}
      <div className="hidden md:flex">{sidebar}</div>

      {/* Painel da conversa */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header mobile: só o trigger do histórico + data atual em sutil */}
        <header className="flex items-center gap-3 px-3 py-3 md:hidden">
          <Sheet open={historySheetOpen} onOpenChange={setHistorySheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
                <History className="h-4 w-4" />
                Histórico
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
          <span className="text-xs text-muted-foreground">
            {dateGroups.length > 0 ? formatDateLabel(selectedDate) : "Nova conversa"}
          </span>
        </header>

        {/* Mensagens */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {isLoadingHistory && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoadingHistory && visibleMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-12 md:py-16">
              <img
                src={mariAvatar}
                alt="Mari"
                className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mb-4 object-cover"
                onError={(e) => {
                  e.currentTarget.src = mariAvatarFallback;
                }}
              />
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Sou a Mar<span className="text-primary">IA</span>na
              </h2>
              <p className="text-muted-foreground max-w-md text-sm md:text-base">
                Sua mentora de IA Aplicada. Qual sua dúvida hoje?
              </p>
            </div>
          )}

          <div className="mx-auto max-w-3xl space-y-4">
            {visibleMessages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[80%] items-start gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  {message.role === "assistant" && (
                    <img
                      src={mariAvatar}
                      alt="Mari"
                      className="h-10 w-10 flex-shrink-0 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = mariAvatarFallback;
                      }}
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2",
                        message.role === "user"
                          ? "bg-brand-strong text-brand-strong-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="flex items-start gap-1">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
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
                          {isStreaming && index === visibleMessages.length - 1 && (
                            <span className="inline-flex items-center text-primary ml-1 animate-pulse">
                              ▌
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] text-muted-foreground",
                        message.role === "user" ? "text-right" : "text-left ml-1"
                      )}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && !isStreaming && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <img
                    src={mariAvatar}
                    alt="Mari"
                    className="h-10 w-10 flex-shrink-0 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = mariAvatarFallback;
                    }}
                  />
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-muted-foreground">
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
        <div className="px-3 py-3 md:px-8 md:py-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 rounded-full border border-brand-hairline bg-background px-4 py-1.5 shadow-sm focus-within:border-brand-strong/40 transition-colors">
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
                className="min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-2"
                disabled={isLoading || isStreaming}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || isStreaming || !input.trim()}
                className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-strong text-brand-strong-foreground hover:bg-brand-strong/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
