
import { PageTitle } from "@/components/shared/PageTitle";
import DiagnosticoEquipeCard from "@/components/skills/visao-geral/DiagnosticoEquipeCard";
import CronogramaPrograma from "@/components/skills/visao-geral/CronogramaPrograma";
import GraficoCalendarioSection from "@/components/skills/visao-geral/GraficoCalendarioSection";

export default function ProjetoSkills() {
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
