import { Card } from "@/components/ui/card";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { BusinessROIChart } from "@/components/mentoria/BusinessROIChart";

import { InsightSemanalCard } from "@/components/mentoria/business/InsightSemanalCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BusinessVisaoGeralGrid() {
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const { data: tasks } = useTasksByUser(businessUserId);

  // KPI: Próxima Sessão — baseada na próxima etapa prevista do contrato
  const hojeISO = new Date().toISOString().slice(0, 10);
  const proximaEtapa = etapas
    ? [...etapas]
        .filter(
          (e) =>
            e.data_prevista &&
            e.status !== "concluida" &&
            e.data_prevista >= hojeISO
        )
        .sort((a, b) =>
          (a.data_prevista ?? "").localeCompare(b.data_prevista ?? "")
        )[0]
    : undefined;

  const proximaSessaoLabel = proximaEtapa?.data_prevista
    ? format(new Date(proximaEtapa.data_prevista), "dd MMM", { locale: ptBR })
    : null;
  const proximaSessaoSub = proximaEtapa
    ? `Etapa ${proximaEtapa.numero_etapa}`
    : "";

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
