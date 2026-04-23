import { Card } from "@/components/ui/card";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { BusinessROIChart } from "@/components/mentoria/BusinessROIChart";

import { InsightSemanalCard } from "@/components/mentoria/business/InsightSemanalCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BusinessVisaoGeralGrid() {
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const { data: tasks } = useTasksByUser(businessUserId);
  const { sessoes } = useMentoriaSessoes(businessUserId);

  // KPI: Próxima Sessão — apenas sessões explicitamente agendadas pelo admin
  const agora = new Date();
  const proximaSessao = sessoes
    ? [...sessoes]
        .filter(
          (s) =>
            s.status === "agendada" &&
            s.data_sessao &&
            new Date(s.data_sessao) > agora
        )
        .sort(
          (a, b) =>
            new Date(a.data_sessao).getTime() -
            new Date(b.data_sessao).getTime()
        )[0]
    : undefined;

  const proximaSessaoLabel = proximaSessao
    ? format(new Date(proximaSessao.data_sessao), "dd MMM 'às' HH'h'mm", {
        locale: ptBR,
      })
    : null;
  const proximaSessaoSub = proximaSessao
    ? proximaSessao.titulo.length > 40
      ? `${proximaSessao.titulo.slice(0, 40)}…`
      : proximaSessao.titulo
    : "Aguardando agendamento";

  // KPI: Tarefas Críticas
  const tarefasCriticasCount = tasks
    ? tasks.filter(
        (t) =>
          (t.prioridade === "urgente" || t.prioridade === "alta") &&
          t.status !== "aprovado"
      ).length
    : 0;

  // KPI: Progresso Geral
  const progressoGeralPct =
    etapas && etapas.length > 0
      ? Math.round(
          (etapas.filter((e: any) => e.status === "concluida").length /
            etapas.length) *
            100
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Linha 1 — 3 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Próxima Sessão
          </span>
          <span className="text-2xl font-bold text-foreground">
            {proximaSessaoLabel ?? "—"}
          </span>
          <span className="text-xs text-muted-foreground">
            {proximaSessaoSub}
          </span>
        </Card>

        <Card className="p-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Tarefas Críticas
          </span>
          <span className="text-2xl font-bold text-foreground">
            {tarefasCriticasCount}
          </span>
          <span className="text-xs text-muted-foreground">em aberto</span>
        </Card>

        <Card className="p-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Progresso Geral
          </span>
          <span className="text-2xl font-bold text-foreground">
            {progressoGeralPct}%
          </span>
          <span className="text-xs text-muted-foreground">das etapas</span>
        </Card>
      </div>

      {/* Linha 2 — ROI Chart (largura total) */}
      <BusinessROIChart />

      {/* Linha 3 — Insight semanal (largura total) */}
      <InsightSemanalCard />
    </div>
  );
}
