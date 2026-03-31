import { useEffect, useRef } from "react";
import { useAvisosPublicos, useMarcarAvisosComoLidos } from "@/hooks/useAvisosPublicos";
import { useNotificacoesPessoais, useMarcarNotificacoesComoLidas } from "@/hooks/useNotificacoesPessoais";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Package, ListChecks, Calendar, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTitle } from "@/components/shared/PageTitle";
import { useNavigate } from "react-router-dom";

const tipoIconMap: Record<string, React.ReactNode> = {
  entrega: <Package className="h-5 w-5 text-blue-400" />,
  tarefa: <ListChecks className="h-5 w-5 text-orange-400" />,
  sessao: <Calendar className="h-5 w-5 text-green-400" />,
  info: <Info className="h-5 w-5 text-muted-foreground" />,
  alerta: <Info className="h-5 w-5 text-destructive" />,
  duvida: <Info className="h-5 w-5 text-muted-foreground" />,
  formulario: <Info className="h-5 w-5 text-muted-foreground" />,
  novo_conteudo: <Info className="h-5 w-5 text-muted-foreground" />,
  urgente: <Info className="h-5 w-5 text-destructive" />,
};

export default function Notificacoes() {
  const navigate = useNavigate();
  const { data: avisos, isLoading: loadingAvisos } = useAvisosPublicos();
  const { mutate: marcarAvisosComoLidos } = useMarcarAvisosComoLidos();
  const { data: notificacoes, isLoading: loadingNotifs } = useNotificacoesPessoais();
  const { mutate: marcarNotifsComoLidas } = useMarcarNotificacoesComoLidas();
  const marcadoAvisosRef = useRef(false);
  const marcadoNotifsRef = useRef(false);

  // Marcar avisos como lidos
  useEffect(() => {
    if (avisos && avisos.length > 0 && !marcadoAvisosRef.current) {
      const ids = avisos.map(a => a.id);
      marcarAvisosComoLidos(ids);
      marcadoAvisosRef.current = true;
    }
  }, [avisos, marcarAvisosComoLidos]);

  // Marcar notificações pessoais como lidas
  useEffect(() => {
    if (notificacoes && notificacoes.length > 0 && !marcadoNotifsRef.current) {
      const naoLidas = notificacoes.filter(n => !n.lida).map(n => n.id);
      if (naoLidas.length > 0) {
        marcarNotifsComoLidas(naoLidas);
      }
      marcadoNotifsRef.current = true;
    }
  }, [notificacoes, marcarNotifsComoLidas]);

  if (loadingAvisos || loadingNotifs) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-4">
      <div className="mb-6 md:mb-8">
        <PageTitle primary="Avisos e Notificações" icon={<Bell className="h-7 w-7 md:h-8 md:w-8 text-primary shrink-0" />} />
        <p className="text-sm md:text-base text-muted-foreground mt-2">Acompanhe seus avisos, entregas, tarefas e sessões</p>
      </div>

      {/* Notificações pessoais */}
      {notificacoes && notificacoes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Notificações</h2>
          <div className="space-y-2">
            {notificacoes.map((notif) => (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${!notif.lida ? 'border-primary/40 bg-primary/5' : ''}`}
                onClick={() => notif.link && navigate(notif.link)}
              >
                <CardContent className="flex items-start gap-3 py-3 px-4">
                  <div className="mt-0.5 shrink-0">
                    {tipoIconMap[notif.tipo] || <Info className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{notif.titulo}</p>
                    {notif.mensagem && (
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.mensagem}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at!), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {!notif.lida && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Avisos públicos */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Avisos da plataforma</h2>
        <div className="space-y-3">
          {!avisos || avisos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum aviso ativo</h3>
                <p className="text-muted-foreground">Não há avisos publicados no momento</p>
              </CardContent>
            </Card>
          ) : (
            avisos.map((aviso) => (
              <Card key={aviso.id} className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(aviso.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        aviso.tipo === "urgente"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : aviso.tipo === "importante"
                          ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {aviso.tipo}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{aviso.mensagem}</p>
                  {aviso.data_expiracao && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Válido até: {new Date(aviso.data_expiracao).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
