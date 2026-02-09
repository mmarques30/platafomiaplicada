import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Rocket, Settings, TrendingUp, Users, Zap } from "lucide-react";

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

    // Distribuição por tipo
    const individuais = entregas.filter((e) => (e.tipo ?? "individual") === "individual").length;
    const colaborativos = entregas.filter((e) => e.tipo === "colaborativo").length;
    const sistema = entregas.filter((e) => e.tipo === "sistema").length;

    return {
      total,
      emProducao,
      emAndamento,
      backlog,
      economiaTotal,
      progressoMedio,
      individuais,
      colaborativos,
      sistema,
    };
  }, [entregas]);

  const pct = (v: number) =>
    stats.total > 0 ? Math.round((v / stats.total) * 100) : 0;

  const kpis = [
    { label: "Total de Projetos", value: stats.total, icon: Briefcase, color: "text-foreground" },
    { label: "Em Produção", value: stats.emProducao, icon: Rocket, color: "text-[hsl(72,50%,35%)]" },
    { label: "Em Andamento", value: stats.emAndamento, icon: Zap, color: "text-[hsl(210,80%,55%)]" },
    { label: "Economia Total", value: `${stats.economiaTotal}h/sem`, icon: TrendingUp, color: "text-primary" },
  ];

  const tipos = [
    { label: "Individuais", value: stats.individuais, pct: pct(stats.individuais), icon: Users },
    { label: "Colaborativos", value: stats.colaborativos, pct: pct(stats.colaborativos), icon: Users },
    { label: "De Sistema", value: stats.sistema, pct: pct(stats.sistema), icon: Settings },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Visão Geral do Portfólio</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-dashed border-border bg-card p-4 space-y-1"
          >
            <div className="flex items-center gap-2">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Progresso geral */}
      <div className="rounded-xl border border-dashed border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Progresso Geral</span>
          <span className="text-sm font-bold text-foreground">{stats.progressoMedio}%</span>
        </div>
        <Progress value={stats.progressoMedio} className="h-2.5" />
        <p className="text-xs text-muted-foreground">
          {stats.emProducao} concluídos · {stats.emAndamento} em andamento · {stats.backlog} no backlog
        </p>
      </div>

      {/* Distribuição por tipo */}
      <div className="grid grid-cols-3 gap-3">
        {tipos.map((t) => (
          <div
            key={t.label}
            className="rounded-xl border border-dashed border-border bg-card p-3 text-center space-y-1"
          >
            <t.icon className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-lg font-bold text-foreground">{t.value}</p>
            <p className="text-[10px] text-muted-foreground">
              {t.label} ({t.pct}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
