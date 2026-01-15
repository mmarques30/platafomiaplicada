import { TrendingUp, Wrench, Target, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPIData {
  roiEstimado: number;
  ferramentasAprendidas: number;
  implementacao: number;
  proficiencia: number;
  roiTrend?: number;
  ferramentasTrend?: number;
}

interface BusinessKPICardsProps {
  data: KPIData;
}

export function BusinessKPICards({ data }: BusinessKPICardsProps) {
  const kpis = [
    {
      label: "ROI Estimado",
      value: `R$ ${data.roiEstimado.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      trend: data.roiTrend,
      color: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
    },
    {
      label: "Ferramentas Aprendidas",
      value: data.ferramentasAprendidas.toString(),
      icon: Wrench,
      trend: data.ferramentasTrend,
      color: "from-aplicada-green-700/20 to-aplicada-green-800/20",
      iconColor: "text-aplicada-green-600",
      borderColor: "border-aplicada-green-700/30",
    },
    {
      label: "Implementação",
      value: `${data.implementacao}%`,
      icon: Target,
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Proficiência Equipe",
      value: `${data.proficiencia}%`,
      icon: Users,
      color: "from-amber-500/20 to-amber-600/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card 
          key={kpi.label}
          className={`bg-white/5 backdrop-blur-md border ${kpi.borderColor} hover:bg-white/8 transition-all duration-300 hover:translate-y-[-2px]`}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              {kpi.trend !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.trend >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(kpi.trend)}%
                </div>
              )}
            </div>
            
            <p className="text-2xl lg:text-3xl font-bold text-slate-100 mb-1">
              {kpi.value}
            </p>
            <p className="text-sm text-slate-400">
              {kpi.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
