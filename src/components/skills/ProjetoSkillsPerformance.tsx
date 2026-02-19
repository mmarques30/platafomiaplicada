import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Clock, Loader2, FolderKanban } from "lucide-react";
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
    totalProjetosAtivos,
    economiaEstimadaProjetos,
    entregasConcluidas,
    totalEntregas,
    roiProjetadoAnual,
    roadmap,
    isLoading,
  } = hook;

  const [selectedCollaborator, setSelectedCollaborator] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");

  const collaborators = useMemo(() => {
    const names = new Set<string>();
    entregas.forEach((d) => d.responsavelNome && names.add(d.responsavelNome));
    projetos.forEach((p) => p.responsavelNome && names.add(p.responsavelNome));
    return Array.from(names);
  }, [entregas, projetos]);

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

  const isFiltered = selectedCollaborator !== "todos" || selectedStatus !== "todos";

  // KPIs filtrados
  const filteredProjetosAtivos = filteredProjetos.filter(p => !["nao_aprovado", "descartado"].includes(p.status));
  const filteredEconomia = filteredProjetosAtivos.reduce((a, p) => a + (p.horasEstimadas || 0), 0);
  const filteredEntregasConcluidas = filteredDeliveries.filter(d => d.status === "concluido" || d.status === "aprovada").length;

  const statusOptions = [
    { value: "todos", label: "Todos" },
    { value: "levantado", label: "Levantado" },
    { value: "em_andamento", label: "Em andamento" },
    { value: "priorizado", label: "Priorizado" },
    { value: "concluido", label: "Concluído" },
    { value: "pendente", label: "Pendente" },
    { value: "atrasado", label: "Atrasado" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        <FilterSelect label="Colaborador" value={selectedCollaborator} onValueChange={setSelectedCollaborator}
          options={[{ value: "todos", label: "Todos" }, ...collaborators.map((c) => ({ value: c, label: c }))]} />
        <FilterSelect label="Status" value={selectedStatus} onValueChange={setSelectedStatus}
          options={statusOptions} />
      </div>

      {/* KPIs Híbridos - Sempre 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Projetos Mapeados"
          value={`${isFiltered ? filteredProjetosAtivos.length : totalProjetosAtivos}`}
          subtitle="No backlog ativo"
          icon={<FolderKanban className="h-5 w-5" />}
          variant="accent"
        />
        <KPICard
          title="Economia Estimada"
          value={`${isFiltered ? filteredEconomia : economiaEstimadaProjetos}h/sem`}
          subtitle="Projetos aprovados/priorizados"
          icon={<Clock className="h-5 w-5" />}
          variant="accent"
        />
        <KPICard
          title="Entregas"
          value={`${isFiltered ? filteredEntregasConcluidas : entregasConcluidas}/${isFiltered ? filteredDeliveries.length : totalEntregas}`}
          subtitle="Concluídas / Total"
          icon={<Target className="h-5 w-5" />}
          variant="accent"
        />
        <KPICard
          title="ROI Projetado"
          value={formatCurrency(isFiltered ? filteredEconomia * 60 * 52 : roiProjetadoAnual)}
          subtitle="/ano (economia × custo hora)"
          icon={<TrendingUp className="h-5 w-5" />}
          variant="accent"
        />
      </div>

      {/* Donut Charts por Membro */}
      <MemberDonutCharts ranking={ranking} entregas={filteredDeliveries as any} projetos={filteredProjetos} />

      {/* Pie + Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart entregas={filteredDeliveries} projetos={filteredProjetos} />
        <WeeklyBarChart ranking={ranking} entregas={filteredDeliveries} projetos={filteredProjetos} />
      </div>

      {/* Ranking Híbrido */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="bg-[#0D0D0D] rounded-t-xl dark-header">
          <CardTitle>Ranking por Colaborador</CardTitle>
          <CardDescription>Projetos e entregas combinados</CardDescription>
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
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Projetos</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Entregas</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Economia</th>
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
                      <td className="py-3 px-2">
                        <Badge className="border-transparent bg-[hsl(68,40%,88%)] text-[hsl(72,50%,25%)]">
                          {(stat as any).totalProjetos || 0}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">{stat.entregasConcluidas}/{stat.totalEntregas}</td>
                      <td className="py-3 px-2">{stat.horasEconomizadas}h</td>
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
