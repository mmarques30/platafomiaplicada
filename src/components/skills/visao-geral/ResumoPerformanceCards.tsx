import { Clock, TrendingUp, Target, Award } from "lucide-react";
import KPICard from "../performance/KPICard";
import { useSkillsLider } from "@/hooks/useSkillsLider";

export default function ResumoPerformanceCards() {
  const {
    horasEconomizadasTotal,
    roiAcumulado,
    entregasConcluidas,
    totalEntregas,
    semanaAtual,
  } = useSkillsLider();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Horas Economizadas"
        value={`${horasEconomizadasTotal}h`}
        subtitle="Total acumulado"
        icon={<Clock className="h-5 w-5" />}
      />
      <KPICard
        title="ROI Acumulado"
        value={`${Math.round(roiAcumulado)}%`}
        subtitle="Retorno sobre investimento"
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <KPICard
        title="Entregas"
        value={`${entregasConcluidas}/${totalEntregas}`}
        subtitle="Concluídas / Total"
        icon={<Target className="h-5 w-5" />}
      />
      <KPICard
        title="Semana Atual"
        value={`${semanaAtual}`}
        subtitle="de 12 semanas"
        icon={<Award className="h-5 w-5" />}
      />
    </div>
  );
}
