import { useMemo } from "react";
import {
  TrendingUp,
  Clock,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Info,
  CalendarDays,
  FileText,
  StickyNote,
  Link2,
  FolderOpen,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tipo = "info" | "warning" | "success";

interface AtividadeItem {
  tipo: string;
  titulo: string;
  data: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface InsightItem {
  label: string;
  valor: string;
  tipo: Tipo;
}

interface Cronograma {
  percentual: number;
  diasRestantes: number;
}

interface Progresso {
  percentual: number;
  modulosConcluidos: number;
}

interface SaudeProjeto {
  label: string;
  classe: string;
}

interface Props {
  totalEntregas: number;
  progresso: Progresso;
  cronograma: Cronograma | null;
  saudeProjeto: SaudeProjeto;
  dataFim?: string | null;
  arquivosCount: number;
  notasCount: number;
  linksCount: number;
  reportsCount: number;
  atividadeRecente: AtividadeItem[];
  insights: InsightItem[];
}

const tipoConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Arquivo: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
  Anotação: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  Link: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  Report: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
};

const insightStyles: Record<Tipo, { bg: string; icon: React.ComponentType<{ className?: string }>; iconColor: string }> = {
  success: { bg: "bg-emerald-500/5 hover:bg-emerald-500/10", icon: CheckCircle2, iconColor: "text-emerald-500" },
  warning: { bg: "bg-amber-500/5 hover:bg-amber-500/10", icon: AlertCircle, iconColor: "text-amber-500" },
  info: { bg: "bg-sky-500/5 hover:bg-sky-500/10", icon: Info, iconColor: "text-sky-500" },
};

export function ProjetoResumoDashboard({
  totalEntregas,
  progresso,
  cronograma,
  saudeProjeto,
  dataFim,
  arquivosCount,
  notasCount,
  linksCount,
  reportsCount,
  atividadeRecente,
  insights,
}: Props) {
  const totalDocs = arquivosCount + notasCount + linksCount + reportsCount;
  const delta = cronograma ? progresso.percentual - cronograma.percentual : null;

  const radialData = useMemo(
    () => [
      { name: "Cronograma", value: cronograma?.percentual ?? 0, fill: "hsl(var(--chart-4))" },
      { name: "Entregas", value: progresso.percentual, fill: "hsl(var(--primary))" },
    ],
    [cronograma, progresso.percentual]
  );

  const donutData = useMemo(
    () =>
      [
        { name: "Arquivos", value: arquivosCount, fill: "hsl(var(--chart-1))" },
        { name: "Anotações", value: notasCount, fill: "hsl(var(--chart-2))" },
        { name: "Links", value: linksCount, fill: "hsl(var(--chart-3))" },
        { name: "Reports", value: reportsCount, fill: "hsl(var(--chart-4))" },
      ].filter((d) => d.value > 0),
    [arquivosCount, notasCount, linksCount, reportsCount]
  );

  const insightScore = useMemo(() => {
    const ok = insights.filter((i) => i.tipo === "success").length;
    const alertas = insights.filter((i) => i.tipo === "warning").length;
    return { ok, alertas };
  }, [insights]);

  const formatDate = (d?: string | null) =>
    d ? format(new Date(d), "dd/MM/yyyy", { locale: ptBR }) : "—";

  return (
    <div className="space-y-4">
      {/* Linha 1 — KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Progresso"
          value={`${progresso.percentual}%`}
          hint={`${progresso.modulosConcluidos}/${totalEntregas} entregas`}
          icon={TrendingUp}
          accent="text-primary"
          accentBg="bg-primary/10"
        />
        <KpiCard
          label="Saúde do Projeto"
          value={saudeProjeto.label}
          hint={delta !== null ? `${delta >= 0 ? "+" : ""}${delta}% vs cronograma` : "Sem cronograma"}
          icon={Activity}
          accent={
            saudeProjeto.label === "No prazo"
              ? "text-emerald-500"
              : saudeProjeto.label === "Atrasado"
              ? "text-destructive"
              : saudeProjeto.label === "Atenção"
              ? "text-amber-500"
              : "text-muted-foreground"
          }
          accentBg={
            saudeProjeto.label === "No prazo"
              ? "bg-emerald-500/10"
              : saudeProjeto.label === "Atrasado"
              ? "bg-destructive/10"
              : saudeProjeto.label === "Atenção"
              ? "bg-amber-500/10"
              : "bg-muted"
          }
          valueClass="text-base"
        />
        <KpiCard
          label="Prazo"
          value={cronograma ? `${cronograma.diasRestantes}d` : "—"}
          hint={dataFim ? `até ${formatDate(dataFim)}` : "Sem data definida"}
          icon={CalendarDays}
          accent="text-chart-4"
          accentBg="bg-[hsl(var(--chart-4))]/10"
        />
        <KpiCard
          label="Documentação"
          value={String(totalDocs)}
          hint={`${arquivosCount} arq · ${notasCount} not · ${linksCount} lnk`}
          icon={FolderOpen}
          accent="text-chart-3"
          accentBg="bg-[hsl(var(--chart-3))]/10"
        />
      </div>

      {/* Linha 2 — Visualizações */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Radial Progresso x Cronograma */}
        <Card className="border-border/50 lg:col-span-2">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progresso vs Cronograma
              </div>
              <Badge className={`text-[11px] font-medium ${saudeProjeto.classe}`}>
                {saudeProjeto.label}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
              <div className="relative h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="45%"
                    outerRadius="100%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={8} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {progresso.percentual}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Entregas
                  </span>
                </div>
              </div>
              <div className="space-y-3 sm:min-w-[160px]">
                <LegendRow color="hsl(var(--primary))" label="Entregas" value={`${progresso.percentual}%`} />
                <LegendRow
                  color="hsl(var(--chart-4))"
                  label="Cronograma"
                  value={cronograma ? `${cronograma.percentual}%` : "—"}
                />
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Delta
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      delta === null
                        ? "text-muted-foreground"
                        : delta >= 0
                        ? "text-emerald-500"
                        : delta >= -15
                        ? "text-amber-500"
                        : "text-destructive"
                    }`}
                  >
                    {delta !== null ? `${delta >= 0 ? "+" : ""}${delta}%` : "—"}
                  </p>
                </div>
              </div>
            </div>
            {/* Mini timeline */}
            {cronograma && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Início</span>
                  <span>Hoje</span>
                  <span>Fim {dataFim ? `· ${formatDate(dataFim)}` : ""}</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[hsl(var(--chart-4))]/40"
                    style={{ width: `${cronograma.percentual}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground"
                    style={{ left: `${cronograma.percentual}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donut Composição */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FolderOpen className="h-4 w-4 text-primary" />
              Composição da Documentação
            </div>
            {donutData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-1">
                <FolderOpen className="h-7 w-7 text-muted-foreground/40 mb-1" />
                <p className="text-xs text-muted-foreground">Sem documentos ainda</p>
              </div>
            ) : (
              <>
                <div className="relative h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      >
                        {donutData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-foreground tabular-nums">{totalDocs}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Itens</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {donutData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="h-2 w-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                      <span className="ml-auto font-medium text-foreground tabular-nums">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linha 3 — Atividade + Painel */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Atividade Recente — Timeline */}
        <Card className="border-border/50 lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Atividade Recente
            </div>
            {atividadeRecente.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-1">
                <Clock className="h-7 w-7 text-muted-foreground/40 mb-1" />
                <p className="text-xs font-medium text-foreground">Nenhuma atividade ainda</p>
                <p className="text-[11px] text-muted-foreground">
                  Adicione um arquivo, anotação ou link para começar.
                </p>
              </div>
            ) : (
              <div className="relative pl-2">
                <div className="absolute left-[14px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-3">
                  {atividadeRecente.map((item, i) => {
                    const cfg = tipoConfig[item.tipo] || tipoConfig.Arquivo;
                    return (
                      <div key={i} className="relative flex items-start gap-3">
                        <div
                          className={`relative z-10 h-7 w-7 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 ring-2 ring-background`}
                        >
                          <item.icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{item.titulo}</p>
                            <Badge variant="outline" className={`text-[10px] ${cfg.text} border-current/20 flex-shrink-0`}>
                              {item.tipo}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {item.data
                              ? format(new Date(item.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                              : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Painel do Projeto */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lightbulb className="h-4 w-4 text-primary" />
                Painel do Projeto
              </div>
              {insights.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  <span className="text-emerald-500 font-semibold">{insightScore.ok}</span> OK ·{" "}
                  <span className="text-amber-500 font-semibold">{insightScore.alertas}</span> alertas
                </span>
              )}
            </div>
            {insights.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Adicione itens ao projeto para gerar insights.
              </p>
            ) : (
              <div className="space-y-1.5">
                {insights.map((item, i) => {
                  const style = insightStyles[item.tipo];
                  const Icon = style.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-md transition-colors ${style.bg}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${style.iconColor}`} />
                        <span className="text-xs text-foreground truncate">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground flex-shrink-0">{item.valor}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  accentBg,
  valueClass,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  accentBg: string;
  valueClass?: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <div className={`h-7 w-7 rounded-md ${accentBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-3.5 w-3.5 ${accent}`} />
          </div>
        </div>
        <p className={`font-bold text-foreground tabular-nums leading-tight ${valueClass || "text-2xl"}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground truncate">{hint}</p>
      </CardContent>
    </Card>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}