import { Briefcase } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";
import DiagnosticoEquipeCard from "@/components/skills/visao-geral/DiagnosticoEquipeCard";
import ResumoPerformanceCards from "@/components/skills/visao-geral/ResumoPerformanceCards";
import AcessoRapidoCards from "@/components/skills/visao-geral/AcessoRapidoCards";

export default function ProjetoSkills() {
  return (
    <div className="p-6 space-y-6">
      <PageTitle
        primary="Projeto"
        secondary="Skills"
        icon={<Briefcase className="h-7 w-7 text-[hsl(72,50%,35%)]" />}
      />

      {/* Diagnóstico da equipe com barra de progresso */}
      <DiagnosticoEquipeCard />

      {/* KPIs resumidos */}
      <ResumoPerformanceCards />

      {/* Acesso rápido */}
      <AcessoRapidoCards />
    </div>
  );
}
