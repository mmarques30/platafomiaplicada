import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface PortfolioOverviewProps {
  entregas: any[];
}

export default function PortfolioOverview({ entregas }: PortfolioOverviewProps) {
  const stats = useMemo(() => {
    const total = entregas.length;
    const emProducao = entregas.filter((e) =>
      ["concluido", "aprovada"].includes(e.status)
    ).length;
    const emAndamento = entregas.filter((e) => e.status === "em_andamento").length;
    const backlog = entregas.filter((e) => e.status === "pendente").length;
    const economiaTotal = entregas.reduce(
      (sum, e) => sum + (e.economia_horas_semana ?? 0),
      0
    );
    const progressoMedio =
      total > 0
        ? Math.round(
            entregas.reduce((sum, e) => sum + (e.progresso ?? 0), 0) / total
          )
        : 0;

    const individuais = entregas.filter((e) => (e.tipo ?? "individual") === "individual").length;
    const colaborativos = entregas.filter((e) => e.tipo === "colaborativo").length;
    const sistema = entregas.filter((e) => e.tipo === "sistema").length;

    return {
      total, emProducao, emAndamento, backlog, economiaTotal, progressoMedio,
      individuais, colaborativos, sistema,
    };
  }, [entregas]);

  const pct = (v: number) =>
    stats.total > 0 ? Math.round((v / stats.total) * 100) : 0;

  const kpis = [
    { label: "Total de Projetos", value: stats.total, variant: "accent" as const },
    { label: "Em Produção", value: stats.emProducao, variant: "accent" as const },
    { label: "Em Andamento", value: stats.emAndamento, variant: "accent" as const },
    { label: "Economia Total", value: `${stats.economiaTotal}h/sem`, variant: "accent" as const },
  ];

  const tipos = [
    { label: "Individuais", value: stats.individuais, pct: pct(stats.individuais), variant: "accent" as const },
    { label: "Colaborativos", value: stats.colaborativos, pct: pct(stats.colaborativos), variant: "accent" as const },
    { label: "De Sistema", value: stats.sistema, pct: pct(stats.sistema), variant: "accent" as const },
  ];

  const accentCard = "rounded-xl border border-[#9EB038]/30 bg-[#9EB038]/15 border-l-4 border-l-[#9EB038] p-4 space-y-1";

  return (
    <div className="space-y-4">
      

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={accentCard}>
            <span className="text-xs font-semibold text-[#3a3a3a]">
              {kpi.label}
            </span>
            <p className="text-2xl font-extrabold text-[#0D0D0D]">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progresso geral */}
      <div className="rounded-xl border border-border bg-card border-l-4 border-l-[#9EB038] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Progresso Geral</span>
          <span className="text-sm font-extrabold text-foreground">{stats.progressoMedio}%</span>
        </div>
        <Progress value={stats.progressoMedio} className="h-2.5" />
        <p className="text-xs text-muted-foreground">
          {stats.emProducao} concluídos · {stats.emAndamento} em andamento · {stats.backlog} no backlog
        </p>
      </div>

      {/* Distribuição por tipo */}
      <div className="grid grid-cols-3 gap-3">
        {tipos.map((t) => (
          <div key={t.label} className={`${accentCard} text-center`}>
            <p className="text-lg font-extrabold text-[#0D0D0D]">
              {t.value}
            </p>
            <p className="text-[10px] text-[#3a3a3a]">
              {t.label} ({t.pct}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
