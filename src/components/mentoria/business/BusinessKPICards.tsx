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
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      label: "Ferramentas Aprendidas",
      value: data.ferramentasAprendidas.toString(),
      icon: Wrench,
      trend: data.ferramentasTrend,
      iconBg: "bg-brand-strong/15",
      iconColor: "text-brand-strong",
    },
    {
      label: "Implementação",
      value: `${data.implementacao}%`,
      icon: Target,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      label: "Proficiência Equipe",
      value: `${data.proficiencia}%`,
      icon: Users,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card 
          key={kpi.label}
          className="border-border hover:shadow-md transition-all duration-300"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              {kpi.trend !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.trend >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(kpi.trend)}%
                </div>
              )}
            </div>
            
            <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
              {kpi.value}
            </p>
            <p className="text-sm text-muted-foreground">
              {kpi.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
