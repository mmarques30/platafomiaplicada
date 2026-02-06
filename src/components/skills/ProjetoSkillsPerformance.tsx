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
import { TrendingUp, Target, Award, Clock } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

interface Delivery {
  id: string;
  collaborator: string;
  project: string;
  hoursEconomized: number;
  roi: number;
  status: "Concluído" | "Em andamento" | "Atrasado";
  performance: number;
  week: number;
}

// ── Mock data ────────────────────────────────────────────────────────────

const MOCK_DELIVERIES: Delivery[] = [
  { id: "1", collaborator: "Ana Silva", project: "Automação RPA", hoursEconomized: 120, roi: 250, status: "Concluído", performance: 95, week: 2 },
  { id: "2", collaborator: "Ana Silva", project: "Dashboard BI", hoursEconomized: 80, roi: 180, status: "Concluído", performance: 92, week: 4 },
  { id: "3", collaborator: "Carlos Santos", project: "Chatbot Atendimento", hoursEconomized: 200, roi: 320, status: "Concluído", performance: 88, week: 3 },
  { id: "4", collaborator: "Carlos Santos", project: "Análise Preditiva", hoursEconomized: 150, roi: 280, status: "Em andamento", performance: 85, week: 5 },
  { id: "5", collaborator: "Maria Costa", project: "OCR Documentos", hoursEconomized: 180, roi: 310, status: "Concluído", performance: 90, week: 4 },
  { id: "6", collaborator: "João Oliveira", project: "API Integração", hoursEconomized: 90, roi: 160, status: "Em andamento", performance: 78, week: 6 },
  { id: "7", collaborator: "Beatriz Lima", project: "ML Classificação", hoursEconomized: 110, roi: 220, status: "Atrasado", performance: 65, week: 5 },
];

const ROI_DATA = [
  { week: 1, projetado: 5, executado: 0 },
  { week: 2, projetado: 15, executado: 12 },
  { week: 3, projetado: 30, executado: 28 },
  { week: 4, projetado: 50, executado: 52 },
  { week: 5, projetado: 70, executado: 65 },
  { week: 6, projetado: 85, executado: 78 },
  { week: 7, projetado: 100, executado: undefined },
  { week: 8, projetado: 115, executado: undefined },
];

const MATURITY_DATA = [
  { week: "Sem 1", maturidade: 25 },
  { week: "Sem 2", maturidade: 35 },
  { week: "Sem 3", maturidade: 48 },
  { week: "Sem 4", maturidade: 62 },
  { week: "Sem 5", maturidade: 71 },
  { week: "Sem 6", maturidade: 78 },
];

const CURRENT_WEEK = 6;

const PHASES = [
  { name: "Fundação", weeks: [1, 2, 3, 4], color: "bg-[hsl(68,40%,88%)]" },
  { name: "Expansão", weeks: [5, 6, 7, 8], color: "bg-[hsl(68,35%,73%)]" },
  { name: "Consolidação", weeks: [9, 10, 11, 12], color: "bg-[hsl(72,30%,55%)]" },
];

const roiChartConfig: ChartConfig = {
  projetado: { label: "ROI Projetado", color: "hsl(72, 30%, 55%)" },
  executado: { label: "ROI Executado", color: "hsl(72, 50%, 35%)" },
};

const maturityChartConfig: ChartConfig = {
  maturidade: { label: "Maturidade IA", color: "hsl(72, 50%, 35%)" },
};

// ── KPI Card ─────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
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
    case "Concluído":
      return (
        <Badge className="bg-[hsl(72,50%,35%)] text-white border-transparent hover:bg-[hsl(72,50%,30%)]">
          Concluído
        </Badge>
      );
    case "Em andamento":
      return (
        <Badge className="bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)] border-transparent hover:bg-[hsl(68,35%,65%)]">
          Em andamento
        </Badge>
      );
    case "Atrasado":
      return <Badge variant="destructive">Atrasado</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// ── Main component ───────────────────────────────────────────────────────

export default function ProjetoSkillsPerformance() {
  const [selectedPeriod, setSelectedPeriod] = useState("todo");
  const [selectedCollaborator, setSelectedCollaborator] = useState("todos");
  const [selectedProject, setSelectedProject] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  const collaborators = useMemo(
    () => Array.from(new Set(MOCK_DELIVERIES.map((d) => d.collaborator))),
    []
  );
  const projects = useMemo(
    () => Array.from(new Set(MOCK_DELIVERIES.map((d) => d.project))),
    []
  );

  const filteredDeliveries = useMemo(() => {
    return MOCK_DELIVERIES.filter((d) => {
      if (selectedCollaborator !== "todos" && d.collaborator !== selectedCollaborator) return false;
      if (selectedProject !== "todos" && d.project !== selectedProject) return false;
      if (selectedStatus !== "todos" && d.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedCollaborator, selectedProject, selectedStatus]);

  const totalHours = filteredDeliveries.reduce((a, d) => a + d.hoursEconomized, 0);
  const avgROI =
    filteredDeliveries.length > 0
      ? Math.round(filteredDeliveries.reduce((a, d) => a + d.roi, 0) / filteredDeliveries.length)
      : 0;
  const completedCount = filteredDeliveries.filter((d) => d.status === "Concluído").length;
  const avgPerformance =
    filteredDeliveries.length > 0
      ? Math.round(filteredDeliveries.reduce((a, d) => a + d.performance, 0) / filteredDeliveries.length)
      : 0;

  // ── Ranking ──
  const ranking = useMemo(() => {
    const map: Record<
      string,
      { name: string; deliveries: number; hours: number; roi: number; perfSum: number; count: number }
    > = {};
    MOCK_DELIVERIES.forEach((d) => {
      if (!map[d.collaborator]) {
        map[d.collaborator] = { name: d.collaborator, deliveries: 0, hours: 0, roi: 0, perfSum: 0, count: 0 };
      }
      map[d.collaborator].deliveries++;
      map[d.collaborator].hours += d.hoursEconomized;
      map[d.collaborator].roi += d.roi;
      map[d.collaborator].perfSum += d.performance;
      map[d.collaborator].count++;
    });
    return Object.values(map)
      .map((s) => ({ ...s, avgPerformance: Math.round(s.perfSum / s.count) }))
      .sort((a, b) => b.roi - a.roi);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Filtros ── */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSelect
              label="Período"
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              options={[
                { value: "semana", label: "Última semana" },
                { value: "mes", label: "Último mês" },
                { value: "3meses", label: "Últimos 3 meses" },
                { value: "todo", label: "Todo o programa" },
              ]}
            />
            <FilterSelect
              label="Colaborador"
              value={selectedCollaborator}
              onValueChange={setSelectedCollaborator}
              options={[
                { value: "todos", label: "Todos" },
                ...collaborators.map((c) => ({ value: c, label: c })),
              ]}
            />
            <FilterSelect
              label="Projeto"
              value={selectedProject}
              onValueChange={setSelectedProject}
              options={[
                { value: "todos", label: "Todos" },
                ...projects.map((p) => ({ value: p, label: p })),
              ]}
            />
            <FilterSelect
              label="Status"
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              options={[
                { value: "todos", label: "Todos" },
                { value: "Concluído", label: "Concluído" },
                { value: "Em andamento", label: "Em andamento" },
                { value: "Atrasado", label: "Atrasado" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Horas Economizadas"
          value={`${totalHours}h`}
          subtitle="Total acumulado"
          icon={<Clock className="h-5 w-5" />}
          trend="+15% vs semana anterior"
        />
        <KPICard
          title="ROI Acumulado"
          value={`${avgROI}%`}
          subtitle="Média por entrega"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+8% vs meta"
        />
        <KPICard
          title="Entregas Concluídas"
          value={`${completedCount}/${filteredDeliveries.length}`}
          subtitle="Taxa de conclusão"
          icon={<Target className="h-5 w-5" />}
        />
        <KPICard
          title="Performance Média"
          value={`${avgPerformance}%`}
          subtitle="Índice da equipe"
          icon={<Award className="h-5 w-5" />}
        />
      </div>

      {/* ── Cronograma 12 semanas ── */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Cronograma do Programa — 12 Semanas</CardTitle>
          <CardDescription>Progresso através das fases de maturidade IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PHASES.map((phase) => (
              <div key={phase.name} className="space-y-2">
                <p className="text-sm font-semibold">{phase.name}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {phase.weeks.map((week) => {
                    const isPast = week < CURRENT_WEEK;
                    const isCurrent = week === CURRENT_WEEK;
                    return (
                      <div
                        key={week}
                        className={`rounded-md text-center py-2 text-xs font-medium transition-all ${
                          isCurrent
                            ? "bg-[hsl(72,50%,35%)] text-white ring-2 ring-[hsl(72,50%,35%)]/40"
                            : isPast
                            ? phase.color + " text-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
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
        {/* ROI */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Impacto vs ROI</CardTitle>
            <CardDescription>ROI Projetado vs Executado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={roiChartConfig} className="h-[280px] w-full">
              <AreaChart data={ROI_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tickFormatter={(v) => `Sem ${v}`} className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="projetado"
                  stroke="hsl(72, 30%, 55%)"
                  fill="hsl(72, 30%, 55%)"
                  fillOpacity={0.15}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="executado"
                  stroke="hsl(72, 50%, 35%)"
                  fill="hsl(72, 50%, 35%)"
                  fillOpacity={0.25}
                  connectNulls={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Maturidade */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Evolução Maturidade IA</CardTitle>
            <CardDescription>Índice de maturidade por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={maturityChartConfig} className="h-[280px] w-full">
              <BarChart data={MATURITY_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="maturidade" fill="hsl(72, 50%, 35%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Ranking ── */}
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
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">ROI Total</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((stat, idx) => (
                  <tr key={stat.name} className="border-b border-border last:border-0">
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-[hsl(72,50%,35%)] text-white"
                            : idx === 1
                            ? "bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)]"
                            : idx === 2
                            ? "bg-[hsl(68,40%,88%)] text-[hsl(72,50%,25%)]"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium">{stat.name}</td>
                    <td className="py-3 px-2">{stat.deliveries}</td>
                    <td className="py-3 px-2">{stat.hours}h</td>
                    <td className="py-3 px-2">{stat.roi}%</td>
                    <td className="py-3 px-2">
                      <Badge
                        className={`border-transparent ${
                          stat.avgPerformance >= 90
                            ? "bg-[hsl(72,50%,35%)] text-white"
                            : stat.avgPerformance >= 75
                            ? "bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)]"
                            : "bg-[hsl(68,40%,88%)] text-[hsl(72,50%,25%)]"
                        }`}
                      >
                        {stat.avgPerformance}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Filter Select helper ─────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
