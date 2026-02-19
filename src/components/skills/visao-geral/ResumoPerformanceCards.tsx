import KPICard from "../performance/KPICard";
import { useSkillsLider } from "@/hooks/useSkillsLider";

export default function ResumoPerformanceCards() {
  const {
    totalProjetosAtivos,
    economiaEstimadaProjetos,
    entregasConcluidas,
    totalEntregas,
    roiProjetadoAnual,
  } = useSkillsLider();

  const formatCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard title="Projetos Mapeados" value={`${totalProjetosAtivos}`} subtitle="No backlog ativo" icon={null} variant="accent" />
      <KPICard title="Economia Estimada" value={`${economiaEstimadaProjetos}h/sem`} subtitle="Projetos aprovados/priorizados" icon={null} variant="accent" />
      <KPICard title="Entregas" value={`${entregasConcluidas}/${totalEntregas}`} subtitle="Concluídas / Total" icon={null} variant="accent" />
      <KPICard title="ROI Projetado" value={formatCurrency(roiProjetadoAnual)} subtitle="/ano" icon={null} variant="accent" />
    </div>
  );
}
