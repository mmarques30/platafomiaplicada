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
        <Card key={card.label} className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="py-5 px-3 flex flex-col items-center text-center space-y-1.5">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{card.label}</span>
            <p className="text-sm font-semibold truncate max-w-full">{card.value}</p>
            {card.extra && <div className="w-4/5 mx-auto">{card.extra}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
