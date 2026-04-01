import { Card } from "@/components/ui/card";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { useProximaAula } from "@/hooks/useCalendarioAulas";
import { BusinessROIChart } from "@/components/mentoria/BusinessROIChart";
import BusinessReportsCard from "@/components/mentoria/business/BusinessReportsCard";
import { InsightSemanalCard } from "@/components/mentoria/business/InsightSemanalCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BusinessVisaoGeralGrid() {
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const { data: tasks } = useTasksByUser(businessUserId);
  const { data: proximaAula } = useProximaAula();

  // KPI: Próxima Sessão
  const proximaSessaoLabel = proximaAula?.data_aula
    ? format(new Date(proximaAula.data_aula), "dd MMM", { locale: ptBR })
    : null;
  const proximaSessaoHora = proximaAula?.horario ?? null;

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
            {proximaSessaoHora ?? ""}
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

      {/* Linha 2 — ROI Chart (2/3) + Reports (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <BusinessROIChart />
        </div>
        <div className="md:col-span-1">
          <BusinessReportsCard />
        </div>
      </div>

      {/* Linha 3 — Insight semanal (largura total) */}
      <InsightSemanalCard />
    </div>
  );
}
