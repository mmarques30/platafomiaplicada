import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import PortfolioOverview from "@/components/skills/kanban/PortfolioOverview";
import BacklogView from "@/components/skills/backlog/BacklogView";
import EntregasProjetadasVsExecutadasChart from "@/components/skills/charts/EntregasProjetadasVsExecutadasChart";
import { useSkillsEntregas } from "@/hooks/useSkillsEntregas";
import { useSkillsEquipe } from "@/hooks/useSkillsEquipe";

export default function ProjetoSkillsProjetosPage() {
  const navigate = useNavigate();
  const { equipeId, isLoading } = useSkillsMembro();
  const { equipe } = useSkillsEquipe();
  const { entregas, isLoading: isLoadingEntregas } = useSkillsEntregas();

  useEffect(() => {
    if (!isLoading && !equipeId) {
      navigate("/skills/projeto", { replace: true });
    }
  }, [isLoading, equipeId, navigate]);

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
        <TabsList>
          <TabsTrigger value="acompanhamento">Acompanhamento</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
        </TabsList>

        <TabsContent value="acompanhamento" className="space-y-6">
          
          <PortfolioOverview entregas={entregas ?? []} />
          <EntregasProjetadasVsExecutadasChart entregas={entregas ?? []} dataInicio={equipe?.data_inicio} />
        </TabsContent>

        <TabsContent value="backlog">
          <BacklogView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
