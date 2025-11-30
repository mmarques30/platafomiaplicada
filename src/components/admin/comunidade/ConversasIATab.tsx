import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Bot, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatMessage {
  id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface GroupedChat {
  user_id: string;
  nome_completo: string;
  total_messages: number;
  last_message_at: string;
  messages: ChatMessage[];
}

export function ConversasIATab() {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: groupedChats, isLoading } = useQuery({
    queryKey: ["admin-chat-messages"],
    queryFn: async () => {
      // Buscar todas as mensagens
      const { data: messages, error: messagesError } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Buscar perfis dos usuários
      const userIds = [...new Set(messages.map((m) => m.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nome_completo")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      const profilesMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile.nome_completo;
        return acc;
      }, {} as Record<string, string>);

      // Agrupar mensagens por user_id
      const grouped = messages.reduce((acc, msg) => {
        const userId = msg.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            nome_completo: profilesMap[userId] || "Usuário desconhecido",
            total_messages: 0,
            last_message_at: msg.created_at,
            messages: [],
          };
        }
        acc[userId].total_messages++;
        acc[userId].messages.push(msg);
        return acc;
      }, {} as Record<string, GroupedChat>);

      // Converter para array e ordenar por última mensagem
      return Object.values(grouped).sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() -
          new Date(a.last_message_at).getTime()
      );
    },
  });

  const filteredChats = groupedChats?.filter((chat) =>
    chat.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div>Carregando conversas...</div>;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Conversas com MarIAna</CardTitle>
        <p className="text-sm text-muted-foreground">
          Histórico completo de todas as conversas com o chatbot
        </p>

        <Input
          placeholder="Buscar por nome do usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-4"
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredChats?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm
              ? "Nenhuma conversa encontrada"
              : "Nenhuma conversa com MarIAna ainda"}
          </div>
        ) : (
          filteredChats?.map((chat) => (
            <div
              key={chat.user_id}
              className="border border-border rounded-lg overflow-hidden"
            >
              {/* Card Header */}
              <div
                className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  setExpandedUserId(
                    expandedUserId === chat.user_id ? null : chat.user_id
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {chat.nome_completo}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{chat.total_messages} mensagens</span>
                      <span>
                        Última:{" "}
                        {formatDistanceToNow(new Date(chat.last_message_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      expandedUserId === chat.user_id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Messages */}
              {expandedUserId === chat.user_id && (
                <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {chat.messages
                    .sort(
                      (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    )
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.role === "user" ? "justify-start" : "justify-end"
                        }`}
                      >
                        {msg.role === "user" && (
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}

                        <div
                          className={`flex-1 max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-muted/50"
                              : "bg-primary/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">
                              {msg.role === "user" ? "Usuário" : "MarIAna"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>

                        {msg.role === "assistant" && (
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
