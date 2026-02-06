import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { TrendingUp, Target, Award, Clock, Loader2 } from "lucide-react";
import { useSkillsLider } from "@/hooks/useSkillsLider";

// ── Chart configs ────────────────────────────────────────────────────────

const roiChartConfig: ChartConfig = {
  projetado: { label: "ROI Projetado", color: "hsl(72, 30%, 55%)" },
  executado: { label: "ROI Executado", color: "hsl(72, 50%, 35%)" },
};

const maturityChartConfig: ChartConfig = {
  maturidade: { label: "Maturidade IA", color: "hsl(72, 50%, 35%)" },
};

// ── KPI Card ─────────────────────────────────────────────────────────────

function KPICard({ title, value, subtitle, icon, trend }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; trend?: string;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-[hsl(72,50%,35%)]">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "concluido":
    case "aprovada":
      return <Badge className="bg-[hsl(72,50%,35%)] text-white border-transparent hover:bg-[hsl(72,50%,30%)]">Concluído</Badge>;
    case "em_andamento":
      return <Badge className="bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)] border-transparent hover:bg-[hsl(68,35%,65%)]">Em andamento</Badge>;
    case "atrasado":
      return <Badge variant="destructive">Atrasado</Badge>;
    default:
      return <Badge variant="outline">Pendente</Badge>;
  }
}

// ── Main component ───────────────────────────────────────────────────────

export default function ProjetoSkillsPerformance() {
  const {
    entregas,
    ranking,
    semanaAtual,
    horasEconomizadasTotal,
    entregasConcluidas,
    totalEntregas,
    performanceMedia,
    roiAcumulado,
    roiChartData,
    maturidadeChartData,
    roadmap,
    isLoading,
  } = useSkillsLider();

  const [selectedCollaborator, setSelectedCollaborator] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  const collaborators = useMemo(
    () => Array.from(new Set(entregas.map((d) => d.responsavelNome).filter(Boolean))) as string[],
    [entregas]
  );

  const filteredDeliveries = useMemo(() => {
    return entregas.filter((d) => {
      if (selectedCollaborator !== "todos" && d.responsavelNome !== selectedCollaborator) return false;
      if (selectedStatus !== "todos" && d.status !== selectedStatus) return false;
      return true;
    });
  }, [entregas, selectedCollaborator, selectedStatus]);

  const filteredHours = filteredDeliveries.reduce((a, d) => a + d.economiaHorasSemana, 0);
  const filteredCompleted = filteredDeliveries.filter((d) => d.status === "concluido" || d.status === "aprovada").length;

  // Build phases from roadmap or fallback
  const phases = useMemo(() => {
    if (roadmap.length > 0) {
      return roadmap.map((r) => ({
        name: r.nomeFase || `Fase ${r.numeroFase}`,
        weeks: Array.from({ length: r.semanaFim - r.semanaInicio + 1 }, (_, i) => r.semanaInicio + i),
        color: r.numeroFase === 1 ? "bg-[hsl(68,40%,88%)]" : r.numeroFase === 2 ? "bg-[hsl(68,35%,73%)]" : "bg-[hsl(72,30%,55%)]",
      }));
    }
    return [
      { name: "Fundação", weeks: [1, 2, 3, 4], color: "bg-[hsl(68,40%,88%)]" },
      { name: "Expansão", weeks: [5, 6, 7, 8], color: "bg-[hsl(68,35%,73%)]" },
      { name: "Consolidação", weeks: [9, 10, 11, 12], color: "bg-[hsl(72,30%,55%)]" },
    ];
  }, [roadmap]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Filtros ── */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSelect label="Colaborador" value={selectedCollaborator} onValueChange={setSelectedCollaborator}
              options={[{ value: "todos", label: "Todos" }, ...collaborators.map((c) => ({ value: c, label: c }))]} />
            <FilterSelect label="Status" value={selectedStatus} onValueChange={setSelectedStatus}
              options={[
                { value: "todos", label: "Todos" },
                { value: "concluido", label: "Concluído" },
                { value: "em_andamento", label: "Em andamento" },
                { value: "atrasado", label: "Atrasado" },
                { value: "pendente", label: "Pendente" },
              ]} />
          </div>
        </CardContent>
      </Card>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Horas Economizadas" value={`${selectedCollaborator !== "todos" || selectedStatus !== "todos" ? filteredHours : horasEconomizadasTotal}h`} subtitle="Total acumulado" icon={<Clock className="h-5 w-5" />} />
        <KPICard title="ROI Acumulado" value={`${Math.round(roiAcumulado)}%`} subtitle="Retorno sobre investimento" icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Entregas Concluídas" value={`${selectedCollaborator !== "todos" || selectedStatus !== "todos" ? filteredCompleted : entregasConcluidas}/${selectedCollaborator !== "todos" || selectedStatus !== "todos" ? filteredDeliveries.length : totalEntregas}`} subtitle="Taxa de conclusão" icon={<Target className="h-5 w-5" />} />
        <KPICard title="Performance Média" value={`${Math.round(performanceMedia)}%`} subtitle="Índice da equipe" icon={<Award className="h-5 w-5" />} />
      </div>

      {/* ── Cronograma 12 semanas ── */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Cronograma do Programa — 12 Semanas</CardTitle>
          <CardDescription>Progresso através das fases de maturidade IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phases.map((phase) => (
              <div key={phase.name} className="space-y-2">
                <p className="text-sm font-semibold">{phase.name}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {phase.weeks.map((week) => {
                    const isPast = week < semanaAtual;
                    const isCurrent = week === semanaAtual;
                    return (
                      <div key={week} className={`rounded-md text-center py-2 text-xs font-medium transition-all ${
                        isCurrent ? "bg-[hsl(72,50%,35%)] text-white ring-2 ring-[hsl(72,50%,35%)]/40"
                          : isPast ? phase.color + " text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        Sem {week}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Impacto vs ROI</CardTitle>
            <CardDescription>ROI Projetado vs Executado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={roiChartConfig} className="h-[280px] w-full">
              <AreaChart data={roiChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semana" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="projetado" stroke="hsl(72, 30%, 55%)" fill="hsl(72, 30%, 55%)" fillOpacity={0.15} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="executado" stroke="hsl(72, 50%, 35%)" fill="hsl(72, 50%, 35%)" fillOpacity={0.25} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Evolução Maturidade IA</CardTitle>
            <CardDescription>Índice de maturidade por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={maturityChartConfig} className="h-[280px] w-full">
              <BarChart data={maturidadeChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="semana" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="maturidade" fill="hsl(72, 50%, 35%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Ranking ── */}
      {ranking.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Ranking de Entregas por Colaborador</CardTitle>
            <CardDescription>Performance e indicadores individuais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Colaborador</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Entregas</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Horas Economizadas</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((stat) => (
                    <tr key={stat.userId} className="border-b border-border last:border-0">
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          stat.posicao === 1 ? "bg-[hsl(72,50%,35%)] text-white"
                            : stat.posicao === 2 ? "bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)]"
                            : stat.posicao === 3 ? "bg-[hsl(68,40%,88%)] text-[hsl(72,50%,25%)]"
                            : "bg-muted text-muted-foreground"
                        }`}>{stat.posicao}</span>
                      </td>
                      <td className="py-3 px-2 font-medium">{stat.nome}</td>
                      <td className="py-3 px-2">{stat.entregasConcluidas}/{stat.totalEntregas}</td>
                      <td className="py-3 px-2">{stat.horasEconomizadas}h</td>
                      <td className="py-3 px-2">
                        <Badge className={`border-transparent ${
                          stat.performanceMedia >= 90 ? "bg-[hsl(72,50%,35%)] text-white"
                            : stat.performanceMedia >= 75 ? "bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)]"
                            : "bg-[hsl(68,40%,88%)] text-[hsl(72,50%,25%)]"
                        }`}>{Math.round(stat.performanceMedia)}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Filter Select helper ─────────────────────────────────────────────────

function FilterSelect({ label, value, onValueChange, options }: {
  label: string; value: string; onValueChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
