import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Award, Clock, Loader2 } from "lucide-react";
import { useSkillsLider } from "@/hooks/useSkillsLider";
import KPICard from "./performance/KPICard";
import FilterSelect from "./performance/FilterSelect";
import MemberDonutCharts from "./performance/MemberDonutCharts";
import StatusPieChart from "./performance/StatusPieChart";
import WeeklyBarChart from "./performance/WeeklyBarChart";

export default function ProjetoSkillsPerformance() {
  const hook = useSkillsLider();

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
  } = hook;

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

  const isFiltered = selectedCollaborator !== "todos" || selectedStatus !== "todos";

  return (
    <div className="space-y-6">
      {/* Filtros */}
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

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Horas Economizadas" value={`${isFiltered ? filteredHours : horasEconomizadasTotal}h`} subtitle="Total acumulado" icon={<Clock className="h-5 w-5" />} />
        <KPICard title="ROI Acumulado" value={`${Math.round(roiAcumulado)}%`} subtitle="Retorno sobre investimento" icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Entregas Concluídas" value={`${isFiltered ? filteredCompleted : entregasConcluidas}/${isFiltered ? filteredDeliveries.length : totalEntregas}`} subtitle="Taxa de conclusão" icon={<Target className="h-5 w-5" />} />
        <KPICard title="Performance Média" value={`${Math.round(performanceMedia)}%`} subtitle="Índice da equipe" icon={<Award className="h-5 w-5" />} />
      </div>

      {/* Cronograma 12 semanas */}
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

      {/* Donut Charts por Membro */}
      <MemberDonutCharts ranking={ranking} entregas={filteredDeliveries as any} />

      {/* Pie + Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart entregas={filteredDeliveries} />
        <WeeklyBarChart ranking={ranking} entregas={filteredDeliveries} />
      </div>

      {/* Ranking */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Ranking de Entregas por Colaborador</CardTitle>
          <CardDescription>Performance e indicadores individuais</CardDescription>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum dado disponível ainda. As entregas aparecerão aqui conforme forem registradas.
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
