import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, AlertTriangle, Package, Video, Clock, ExternalLink } from "lucide-react";
import { differenceInHours, differenceInWeeks, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

export function BusinessVisaoRapida() {
  const { user } = useAuth();
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas = [] } = useEtapasBusiness(contrato?.id);
  const { entregas } = useEntregasBusiness(contrato?.id);

  // Próxima sessão
  const { data: proximaSessao } = useQuery({
    queryKey: ["proxima-sessao-business", businessUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessoes_mentoria")
        .select("*")
        .eq("user_id", businessUserId!)
        .eq("status", "agendada")
        .gte("data_sessao", new Date().toISOString())
        .order("data_sessao", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!businessUserId,
  });

  // Tarefas críticas
  const { data: tarefasCriticas = 0 } = useQuery({
    queryKey: ["tarefas-criticas-business", businessUserId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("tarefas_mentoria")
        .select("id", { count: "exact", head: true })
        .eq("user_id", businessUserId!)
        .in("prioridade", ["alta", "critica"])
        .not("status", "eq", "concluida");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!businessUserId,
  });

  // Profile nome
  const nome = user?.user_metadata?.nome_completo?.split(" ")[0] || "parceiro";

  // Semana da jornada
  const semanaAtual = contrato?.data_inicio
    ? differenceInWeeks(new Date(), parseISO(contrato.data_inicio)) + 1
    : null;

  // Progresso geral das etapas
  const etapasConcluidas = etapas.filter((e) => e.status === "concluida").length;
  const totalEtapas = etapas.length || 1;
  const progressoGeral = Math.round((etapasConcluidas / totalEtapas) * 100);

  // Status do contrato
  const statusContrato = contrato?.status || "ativo";
  const statusConfig: Record<string, { label: string; className: string }> = {
    ativo: { label: "Em andamento", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    pausado: { label: "Pausado", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    concluido: { label: "Concluído", className: "bg-muted text-muted-foreground border-border" },
  };
  const statusInfo = statusConfig[statusContrato] || statusConfig.ativo;

  // Última entrega concluída
  const ultimaEntrega = entregas
    .filter((e) => e.status === "concluida")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  return (
    <div className="space-y-4">
      {/* Header contextual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Olá, {nome}
            {semanaAtual && (
              <span className="text-muted-foreground font-normal">
                {" "}— Semana {semanaAtual} da sua jornada
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={statusInfo.className}>
            {statusInfo.label}
          </Badge>
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={progressoGeral} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{progressoGeral}%</span>
          </div>
        </div>
      </div>

      {/* Grid de 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Próxima Sessão */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Próxima Sessão
            </div>
            {proximaSessao ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {format(parseISO(proximaSessao.data_sessao), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">{proximaSessao.titulo}</p>
                {proximaSessao.video_url ? (
                  <a
                    href={proximaSessao.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Entrar na reunião
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Aguardando link
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma sessão agendada</p>
            )}
          </CardContent>
        </Card>

        {/* Tarefas Críticas */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              Tarefas Críticas
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{tarefasCriticas}</p>
              <p className="text-xs text-muted-foreground">
                {tarefasCriticas === 0
                  ? "Nenhuma tarefa urgente pendente"
                  : `tarefa${tarefasCriticas > 1 ? "s" : ""} com prioridade alta ou crítica`}
              </p>
              {tarefasCriticas > 0 && (
                <Link
                  to="/mentoria/tarefas"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Ver tarefas
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Última Entrega */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Última Entrega
            </div>
            {ultimaEntrega ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground line-clamp-1">{ultimaEntrega.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(ultimaEntrega.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  Concluída
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma entrega concluída ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
