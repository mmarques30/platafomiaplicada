import { useState } from "react";
import {
  useNotificacoes,
  useNotificacoesNaoLidas,
  useMarcarComoLida,
  useDeletarNotificacao,
} from "@/hooks/useNotificacoes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Notificacoes() {
  const { data: todasNotificacoes, isLoading } = useNotificacoes();
  const { data: naoLidas } = useNotificacoesNaoLidas();
  const marcarComoLida = useMarcarComoLida();
  const deletarNotificacao = useDeletarNotificacao();
  const [activeTab, setActiveTab] = useState("nao-lidas");

  const handleMarcarComoLida = (id: string) => {
    marcarComoLida.mutate(id);
  };

  const handleDeletar = (id: string) => {
    deletarNotificacao.mutate(id);
  };

  const notificacoes = activeTab === "nao-lidas" ? naoLidas : todasNotificacoes;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Bell className="h-10 w-10 text-primary" />
          Notificações
        </h1>
        <p className="text-muted-foreground">Acompanhe suas atualizações e alertas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="nao-lidas" className="relative">
            Não Lidas
            {naoLidas && naoLidas.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {naoLidas.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {!notificacoes || notificacoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {activeTab === "nao-lidas" ? (
                  <>
                    <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma notificação não lida</h3>
                    <p className="text-muted-foreground">Você está em dia com suas notificações!</p>
                  </>
                ) : (
                  <>
                    <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma notificação</h3>
                    <p className="text-muted-foreground">Você ainda não recebeu notificações</p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notificacoes.map((notificacao) => (
                <Card
                  key={notificacao.id}
                  className={`transition-all ${
                    !notificacao.lida ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{notificacao.titulo}</CardTitle>
                          {!notificacao.lida && (
                            <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                          )}
                        </div>
                        <CardDescription>
                          {formatDistanceToNow(new Date(notificacao.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{notificacao.tipo}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{notificacao.mensagem}</p>
                    <div className="flex gap-2 flex-wrap">
                      {notificacao.link && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={notificacao.link}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver mais
                          </Link>
                        </Button>
                      )}
                      {!notificacao.lida && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarcarComoLida(notificacao.id)}
                          disabled={marcarComoLida.isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como lida
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletar(notificacao.id)}
                        disabled={deletarNotificacao.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
