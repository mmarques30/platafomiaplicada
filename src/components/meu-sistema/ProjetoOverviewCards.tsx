import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Layers, Calendar, Users } from "lucide-react";
import { differenceInDays } from "date-fns";

interface ProjetoOverviewCardsProps {
  progressoGeral: number;
  faseAtual: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  totalEtapas: number;
}

export function ProjetoOverviewCards({
  progressoGeral,
  faseAtual,
  dataInicio,
  dataFim,
  totalEtapas,
}: ProjetoOverviewCardsProps) {
  const diasDecorridos = dataInicio ? differenceInDays(new Date(), new Date(dataInicio)) : 0;
  const diasTotais = dataInicio && dataFim ? differenceInDays(new Date(dataFim), new Date(dataInicio)) : 1;
  const cronogramaLabel = `${Math.max(0, diasDecorridos)}/${diasTotais} dias`;

  const cards = [
    {
      icon: TrendingUp,
      label: "Progresso Geral",
      value: `${progressoGeral}%`,
      extra: <Progress value={progressoGeral} className="h-1.5 mt-2" />,
    },
    {
      icon: Layers,
      label: "Fase Atual",
      value: faseAtual || "—",
    },
    {
      icon: Calendar,
      label: "Cronograma",
      value: cronogramaLabel,
    },
    {
      icon: Users,
      label: "Etapas",
      value: `${totalEtapas} etapas`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <card.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-xl font-bold">{card.value}</p>
            {card.extra}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
