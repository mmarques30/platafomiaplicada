import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortfolioOverview from "@/components/skills/kanban/PortfolioOverview";
import PortfolioSidebar from "@/components/skills/kanban/PortfolioSidebar";
import ProjetosResumoTable from "@/components/skills/kanban/ProjetosResumoTable";
import BacklogView from "@/components/skills/backlog/BacklogView";
import EntregasProjetadasVsExecutadasChart from "@/components/skills/charts/EntregasProjetadasVsExecutadasChart";
import ProjetosFilterBar, { type ProjetosFilters } from "@/components/skills/filters/ProjetosFilterBar";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { useSkillsEquipe } from "@/hooks/useSkillsEquipe";
import { isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

export default function ProjetoSkillsProjetosPage() {
  const navigate = useNavigate();
  const { equipeId, isLoading } = useSkillsMembro();
  const { equipe, membros } = useSkillsEquipe();
  const { entregas, isLoading: isLoadingEntregas } = useSkillsEntregas();

  const [filters, setFilters] = useState<ProjetosFilters>({
    projeto: "todos",
    responsavel: "todos",
    dataInicio: undefined,
    dataFim: undefined,
  });

  useEffect(() => {
    if (!isLoading && !equipeId) {
      navigate("/skills/projeto", { replace: true });
    }
  }, [isLoading, equipeId, navigate]);

  const filteredEntregas = useMemo(() => {
    if (!entregas) return [];
    return entregas.filter((e: any) => {
      if (filters.projeto !== "todos" && e.id !== filters.projeto) return false;
      if (filters.responsavel !== "todos" && e.responsavel_id !== filters.responsavel) return false;
      if (filters.dataInicio) {
        const prazo = e.prazo ? new Date(e.prazo) : null;
        const created = new Date(e.created_at);
        const ref = prazo || created;
        if (isBefore(ref, startOfDay(filters.dataInicio))) return false;
      }
      if (filters.dataFim) {
        const prazo = e.prazo ? new Date(e.prazo) : null;
        const created = new Date(e.created_at);
        const ref = prazo || created;
        if (isAfter(ref, endOfDay(filters.dataFim))) return false;
      }
      return true;
    });
  }, [entregas, filters]);

  if (isLoading || !equipeId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageTitle primary="Projeto" secondary="Skills" />

      <Tabs defaultValue="acompanhamento" className="w-full">
        <TabsList className="skills-tabs-list">
          <TabsTrigger value="acompanhamento" className="skills-tabs-trigger">Acompanhamento</TabsTrigger>
          <TabsTrigger value="backlog" className="skills-tabs-trigger" id="backlog-tab">Backlog</TabsTrigger>
        </TabsList>

        <TabsContent value="acompanhamento" className="space-y-5 mt-4">
          <ProjetosFilterBar
            entregas={entregas ?? []}
            membros={membros ?? []}
            filters={filters}
            onFiltersChange={setFilters}
          />
          <PortfolioOverview entregas={filteredEntregas} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <EntregasProjetadasVsExecutadasChart
                entregas={filteredEntregas}
                dataInicio={equipe?.data_inicio || equipe?.created_at}
                dataFim={equipe?.data_fim}
                filtroDataInicio={filters.dataInicio}
                filtroDataFim={filters.dataFim}
              />
            </div>
            <PortfolioSidebar entregas={filteredEntregas} />
          </div>
          <ProjetosResumoTable
            entregas={filteredEntregas}
            onVerMais={() => {
              const tab = document.getElementById("backlog-tab");
              if (tab) tab.click();
            }}
          />
        </TabsContent>

        <TabsContent value="backlog">
          <BacklogView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
