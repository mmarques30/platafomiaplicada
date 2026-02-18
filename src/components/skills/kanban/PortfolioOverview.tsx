import { useMemo } from "react";
import { FolderKanban, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface PortfolioOverviewProps {
  entregas: any[];
  projetos?: any[];
}

export default function PortfolioOverview({ entregas, projetos }: PortfolioOverviewProps) {
  const stats = useMemo(() => {
    const totalProjetos = projetos ? projetos.length : 0;
    const totalEntregas = entregas.length;
    const emProducao = entregas.filter((e) =>
      ["concluido", "aprovada"].includes(e.status)
    ).length;
    const emAndamento = entregas.filter((e) => e.status === "em_andamento").length;
    const economiaTotal = entregas.reduce(
      (sum, e) => sum + (e.economia_horas_semana ?? 0),
      0
    );

    return { totalProjetos, totalEntregas, emProducao, emAndamento, economiaTotal };
  }, [entregas, projetos]);

  const kpis = [
    {
      label: "Total de Projetos",
      value: stats.totalProjetos,
      subtitle: "projetos no backlog",
      icon: FolderKanban,
      color: "#9EB038",
    },
    {
      label: "Total de Entregas",
      value: stats.totalEntregas,
      subtitle: "entregas cadastradas",
      icon: CheckCircle2,
      color: "#9EB038",
    },
    {
      label: "Em Andamento",
      value: stats.emAndamento,
      subtitle: "em desenvolvimento",
      icon: Clock,
      color: "#738925",
    },
    {
      label: "Economia Total",
      value: `${stats.economiaTotal}h`,
      subtitle: "por semana estimadas",
      icon: TrendingUp,
      color: "#9EB038",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${kpi.color}15` }}
              >
                <Icon size={20} style={{ color: kpi.color }} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                {kpi.label}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/70">{kpi.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
