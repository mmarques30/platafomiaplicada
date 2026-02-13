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
    { label: "Individuais", value: stats.individuais, pct: stats.pct(stats.individuais) },
    { label: "Colaborativos", value: stats.colaborativos, pct: stats.pct(stats.colaborativos) },
    { label: "De Sistema", value: stats.sistema, pct: stats.pct(stats.sistema) },
  ];

  return (
    <div className="space-y-4">
      {/* Progresso geral */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Progresso Geral</span>
          <span className="text-sm font-extrabold text-foreground">{stats.progressoMedio}%</span>
        </div>
        <Progress value={stats.progressoMedio} className="h-2" />
        <p className="text-[11px] text-muted-foreground">
          {stats.emProducao} concluídos · {stats.emAndamento} em andamento · {stats.backlog} no backlog
        </p>
      </div>

      {/* Distribuição por tipo */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <span className="text-sm font-semibold text-foreground">Distribuição por Tipo</span>
        <div className="space-y-2.5">
          {tipos.map((t) => (
            <div key={t.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{t.value}</span>
                <span className="text-[10px] text-muted-foreground">({t.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
