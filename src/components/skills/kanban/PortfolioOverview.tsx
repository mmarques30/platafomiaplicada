import { useMemo } from "react";

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
    const economiaTotal = entregas.reduce(
      (sum, e) => sum + (e.economia_horas_semana ?? 0),
      0
    );

    return { total, emProducao, emAndamento, economiaTotal };
  }, [entregas]);

  const kpis = [
    { label: "Total de Projetos", value: stats.total },
    { label: "Em Produção", value: stats.emProducao },
    { label: "Em Andamento", value: stats.emAndamento },
    { label: "Economia Total", value: `${stats.economiaTotal}h/sem` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-0.5"
        >
          <span className="text-[11px] font-medium text-muted-foreground">
            {kpi.label}
          </span>
          <p className="text-xl font-bold text-foreground">
            {kpi.value}
          </p>
        </div>
      ))}
    </div>
  );
}
