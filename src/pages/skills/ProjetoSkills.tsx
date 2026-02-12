
import { PageTitle } from "@/components/shared/PageTitle";
import DiagnosticoEquipeCard from "@/components/skills/visao-geral/DiagnosticoEquipeCard";
import CronogramaPrograma from "@/components/skills/visao-geral/CronogramaPrograma";
import GraficoCalendarioSection from "@/components/skills/visao-geral/GraficoCalendarioSection";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import AdminTeamSelector from "@/components/skills/AdminTeamSelector";
import { Loader2 } from "lucide-react";

export default function ProjetoSkills() {
  const { needsTeamSelection, isLoading } = useSkillsMembro();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (needsTeamSelection) {
    return (
      <div className="p-6 space-y-6">
        <PageTitle primary="Projeto" secondary="Skills" />
        <AdminTeamSelector />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        <PageTitle
          primary="Projeto"
          secondary="Skills"
        />

      {/* Diagnóstico da equipe com barra de progresso */}
      <DiagnosticoEquipeCard />

      {/* Cronograma do Programa */}
      <CronogramaPrograma />

      {/* Gráfico de ROI + Mini Calendário */}
      <GraficoCalendarioSection />
    </div>
  );
}
