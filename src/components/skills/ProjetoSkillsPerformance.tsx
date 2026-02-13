import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Award, Clock, Loader2, FolderKanban } from "lucide-react";
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
    projetos,
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

  const hasEntregas = entregas.length > 0;
  const totalProjetos = projetos.length;
  const projetosEmAndamento = projetos.filter(p => p.status === "em_andamento").length;
  const horasEstimadasProjetos = projetos.reduce((a, p) => a + (p.horasEstimadas || 0), 0);

  const collaborators = useMemo(
    () => {
      if (hasEntregas) {
        return Array.from(new Set(entregas.map((d) => d.responsavelNome).filter(Boolean))) as string[];
      }
      return Array.from(new Set(projetos.map((p) => p.responsavelNome).filter(Boolean))) as string[];
    },
    [entregas, projetos, hasEntregas]
  );

  const filteredDeliveries = useMemo(() => {
    return entregas.filter((d) => {
      if (selectedCollaborator !== "todos" && d.responsavelNome !== selectedCollaborator) return false;
      if (selectedStatus !== "todos" && d.status !== selectedStatus) return false;
      return true;
    });
  }, [entregas, selectedCollaborator, selectedStatus]);

  const filteredProjetos = useMemo(() => {
    return projetos.filter((p) => {
      if (selectedCollaborator !== "todos" && p.responsavelNome !== selectedCollaborator) return false;
      if (selectedStatus !== "todos" && p.status !== selectedStatus) return false;
      return true;
    });
  }, [projetos, selectedCollaborator, selectedStatus]);

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

  // Status options depend on whether we have entregas or projetos
  const statusOptions = hasEntregas
    ? [
        { value: "todos", label: "Todos" },
        { value: "concluido", label: "Concluído" },
        { value: "em_andamento", label: "Em andamento" },
        { value: "atrasado", label: "Atrasado" },
        { value: "pendente", label: "Pendente" },
      ]
    : [
        { value: "todos", label: "Todos" },
        { value: "levantado", label: "Levantado" },
        { value: "em_andamento", label: "Em andamento" },
        { value: "priorizado", label: "Priorizado" },
        { value: "concluido", label: "Concluído" },
      ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-[#9EB038]/15 border-[#9EB038]/20 border-l-4 border-l-[#9EB038]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSelect label="Colaborador" value={selectedCollaborator} onValueChange={setSelectedCollaborator}
              options={[{ value: "todos", label: "Todos" }, ...collaborators.map((c) => ({ value: c, label: c }))]} />
            <FilterSelect label="Status" value={selectedStatus} onValueChange={setSelectedStatus}
              options={statusOptions} />
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasEntregas ? (
          <>
            <KPICard title="Horas Economizadas" value={`${isFiltered ? filteredHours : horasEconomizadasTotal}h`} subtitle="Total acumulado" icon={<Clock className="h-5 w-5" />} variant="dark" />
            <KPICard title="ROI Acumulado" value={`${Math.round(roiAcumulado)}%`} subtitle="Retorno sobre investimento" icon={<TrendingUp className="h-5 w-5" />} variant="accent" />
            <KPICard title="Entregas Concluídas" value={`${isFiltered ? filteredCompleted : entregasConcluidas}/${isFiltered ? filteredDeliveries.length : totalEntregas}`} subtitle="Taxa de conclusão" icon={<Target className="h-5 w-5" />} variant="dark" />
            <KPICard title="Performance Média" value={`${Math.round(performanceMedia)}%`} subtitle="Índice da equipe" icon={<Award className="h-5 w-5" />} variant="accent" />
          </>
        ) : (
          <>
            <KPICard title="Projetos Mapeados" value={`${isFiltered ? filteredProjetos.length : totalProjetos}`} subtitle="Total no backlog" icon={<FolderKanban className="h-5 w-5" />} variant="dark" />
            <KPICard title="Em Andamento" value={`${isFiltered ? filteredProjetos.filter(p => p.status === "em_andamento").length : projetosEmAndamento}`} subtitle="Projetos ativos" icon={<TrendingUp className="h-5 w-5" />} variant="accent" />
            <KPICard title="Economia Estimada" value={`${isFiltered ? filteredProjetos.reduce((a, p) => a + (p.horasEstimadas || 0), 0) : horasEstimadasProjetos}h`} subtitle="Horas/semana potenciais" icon={<Clock className="h-5 w-5" />} variant="dark" />
            <KPICard title="Semana Atual" value={`${semanaAtual}`} subtitle="de 12 semanas" icon={<Award className="h-5 w-5" />} variant="accent" />
          </>
        )}
      </div>

      {/* Donut Charts por Membro */}
      <MemberDonutCharts ranking={ranking} entregas={filteredDeliveries as any} projetos={filteredProjetos} />

      {/* Pie + Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart entregas={filteredDeliveries} projetos={filteredProjetos} />
        <WeeklyBarChart ranking={ranking} entregas={filteredDeliveries} projetos={filteredProjetos} />
      </div>

      {/* Ranking */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="bg-[#0D0D0D] rounded-t-xl">
          <CardTitle style={{ color: "#FFFFFF" }}>{hasEntregas ? "Ranking de Entregas por Colaborador" : "Projetos por Colaborador"}</CardTitle>
          <CardDescription style={{ color: "rgba(255,255,255,0.5)" }}>{hasEntregas ? "Performance e indicadores individuais" : "Projetos atribuídos por membro"}</CardDescription>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum dado disponível ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Colaborador</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{hasEntregas ? "Entregas" : "Projetos"}</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{hasEntregas ? "Horas Economizadas" : "Economia Estimada"}</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">{hasEntregas ? "Performance" : "Status"}</th>
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
                        {hasEntregas ? (
                          <Badge className={`border-transparent ${
                            stat.performanceMedia >= 90 ? "bg-[hsl(72,50%,35%)] text-white"
                              : stat.performanceMedia >= 75 ? "bg-[hsl(68,35%,73%)] text-[hsl(72,50%,25%)]"
                              : "bg-[hsl(68,40%,88%)] text-[hsl(72,50%,25%)]"
                          }`}>{Math.round(stat.performanceMedia)}%</Badge>
                        ) : (
                          <Badge className="border-transparent bg-[hsl(68,40%,88%)] text-[hsl(72,50%,25%)]">
                            {stat.totalEntregas > 0 ? "Atribuído" : "Sem projetos"}
                          </Badge>
                        )}
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
