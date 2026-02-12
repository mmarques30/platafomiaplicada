import { Clock, TrendingUp, Target, Award, FolderKanban } from "lucide-react";
import KPICard from "../performance/KPICard";
import { useSkillsLider } from "@/hooks/useSkillsLider";

export default function ResumoPerformanceCards() {
  const {
    horasEconomizadasTotal,
    roiAcumulado,
    entregasConcluidas,
    totalEntregas,
    semanaAtual,
    entregas,
    projetos,
  } = useSkillsLider();

  const hasEntregas = (entregas || []).length > 0;
  const totalProjetos = (projetos || []).length;
  const horasEstimadas = (projetos || []).reduce((a, p) => a + (p.horasEstimadas || 0), 0);

  if (hasEntregas) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Horas Economizadas" value={`${horasEconomizadasTotal}h`} subtitle="Total acumulado" icon={<Clock className="h-5 w-5" />} />
        <KPICard title="ROI Acumulado" value={`${Math.round(roiAcumulado)}%`} subtitle="Retorno sobre investimento" icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Entregas" value={`${entregasConcluidas}/${totalEntregas}`} subtitle="Concluídas / Total" icon={<Target className="h-5 w-5" />} />
        <KPICard title="Semana Atual" value={`${semanaAtual}`} subtitle="de 12 semanas" icon={<Award className="h-5 w-5" />} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard title="Projetos Mapeados" value={`${totalProjetos}`} subtitle="Total no backlog" icon={<FolderKanban className="h-5 w-5" />} />
      <KPICard title="Economia Estimada" value={`${horasEstimadas}h`} subtitle="Horas/semana potenciais" icon={<Clock className="h-5 w-5" />} />
      <KPICard title="Entregas" value={`${entregasConcluidas}/${totalEntregas}`} subtitle="Concluídas / Total" icon={<Target className="h-5 w-5" />} />
      <KPICard title="Semana Atual" value={`${semanaAtual}`} subtitle="de 12 semanas" icon={<Award className="h-5 w-5" />} />
    </div>
  );
}
