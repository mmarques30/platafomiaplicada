import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";

interface PortfolioSidebarProps {
  entregas: any[];
}

export default function PortfolioSidebar({ entregas }: PortfolioSidebarProps) {
  const stats = useMemo(() => {
    const total = entregas.length;
    const emProducao = entregas.filter((e) =>
      ["concluido", "aprovada"].includes(e.status)
    ).length;
    const emAndamento = entregas.filter((e) => e.status === "em_andamento").length;
    const backlog = entregas.filter((e) => e.status === "pendente").length;
    const progressoMedio =
      total > 0
        ? Math.round(entregas.reduce((sum, e) => sum + (e.progresso ?? 0), 0) / total)
        : 0;

    const individuais = entregas.filter((e) => (e.tipo ?? "individual") === "individual").length;
    const colaborativos = entregas.filter((e) => e.tipo === "colaborativo").length;
    const sistema = entregas.filter((e) => e.tipo === "sistema").length;

    const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

    return { total, emProducao, emAndamento, backlog, progressoMedio, individuais, colaborativos, sistema, pct };
  }, [entregas]);

  const tipos = [
    { label: "Individuais", value: stats.individuais, pct: stats.pct(stats.individuais), color: "#9EB038" },
    { label: "Colaborativos", value: stats.colaborativos, pct: stats.pct(stats.colaborativos), color: "#B8CC5A" },
    { label: "De Sistema", value: stats.sistema, pct: stats.pct(stats.sistema), color: "#B8CC5A" },
  ];

  return (
    <div className="space-y-4">
      {/* Progresso geral */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Progresso Geral</span>
          <div
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: "#9EB03815", color: "#9EB038" }}
          >
            {stats.progressoMedio}%
          </div>
        </div>
        <Progress
          value={stats.progressoMedio}
          className="h-2.5 rounded-full"
          indicatorClassName="rounded-full"
          style={{ ["--progress-color" as string]: "#9EB038" }}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#9EB038" }} />
            <span className="text-[11px] text-muted-foreground">{stats.emProducao} concluídos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#B8CC5A" }} />
            <span className="text-[11px] text-muted-foreground">{stats.emAndamento} em andamento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <span className="text-[11px] text-muted-foreground">{stats.backlog} backlog</span>
          </div>
        </div>
      </div>

      {/* Distribuição por tipo */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <span className="text-sm font-semibold text-foreground">Distribuição por Tipo</span>
        <div className="space-y-3.5">
          {tipos.map((t) => (
            <div key={t.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-xs text-muted-foreground">{t.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">{t.value}</span>
                  <span className="text-[10px] text-muted-foreground">({t.pct}%)</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
