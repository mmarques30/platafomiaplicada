import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
      label: "Progresso Geral",
      value: `${progressoGeral}%`,
      extra: <Progress value={progressoGeral} className="h-1.5 mt-2" />,
    },
    {
      label: "Fase Atual",
      value: faseAtual || "—",
    },
    {
      label: "Cronograma",
      value: cronogramaLabel,
    },
    {
      label: "Etapas",
      value: `${totalEtapas} etapas`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</span>
            <p className="text-lg font-bold">{card.value}</p>
            {card.extra}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
