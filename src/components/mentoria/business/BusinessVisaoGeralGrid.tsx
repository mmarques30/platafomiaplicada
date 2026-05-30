import { Card } from "@/components/ui/card";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { BusinessROIChart } from "@/components/mentoria/BusinessROIChart";
import { InsightSemanalCard } from "@/components/mentoria/business/InsightSemanalCard";

export function BusinessVisaoGeralGrid() {
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const { data: tasks } = useTasksByUser(businessUserId);

  // KPI: Tarefas Críticas
  const tarefasCriticasCount = tasks
    ? tasks.filter(
        (t) =>
          (t.prioridade === "urgente" || t.prioridade === "alta") &&
          t.status !== "aprovado"
      ).length
    : 0;

  // KPI: Etapas concluídas
  const etapasConcluidas = etapas
    ? etapas.filter((e: any) => e.status === "concluida").length
    : 0;
  const etapasTotal = etapas?.length ?? 0;

  // KPI: Progresso Geral
  const progressoGeralPct =
    etapasTotal > 0 ? Math.round((etapasConcluidas / etapasTotal) * 100) : 0;

  const kpis = [
    { label: "Tarefas Críticas", value: String(tarefasCriticasCount), hint: "em aberto" },
    { label: "Etapas Concluídas", value: `${etapasConcluidas}/${etapasTotal}`, hint: "do projeto" },
    { label: "Progresso Geral", value: `${progressoGeralPct}%`, hint: "das etapas" },
  ];

  return (
    <div className="space-y-4">
      {/* Linha 1 — KPIs padronizados na marca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="bg-brand-cream-soft border-brand-hairline shadow-none p-5 flex flex-col gap-1"
          >
            <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">
              {kpi.label}
            </span>
            <span className="font-serif-display text-3xl text-foreground tabular-nums leading-none">
              {kpi.value}
            </span>
            <span className="text-xs text-muted-foreground">{kpi.hint}</span>
          </Card>
        ))}
      </div>

      {/* Linha 2 — ROI Chart (largura total) */}
      <BusinessROIChart />

      {/* Linha 3 — Insight semanal (largura total) */}
      <InsightSemanalCard />
    </div>
  );
}
