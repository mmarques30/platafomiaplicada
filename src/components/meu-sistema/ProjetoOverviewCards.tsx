import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays } from "date-fns";

interface ProjetoOverviewCardsProps {
  progressoGeral: number;
  etapaAtualNumero: number | null;
  dataInicio: string | null;
  dataFim: string | null;
  entregasConcluidas: number;
  totalEntregas: number;
}

export function ProjetoOverviewCards({
  progressoGeral,
  etapaAtualNumero,
  dataInicio,
  dataFim,
  entregasConcluidas,
  totalEntregas,
}: ProjetoOverviewCardsProps) {
  const diasDecorridos = dataInicio ? differenceInDays(new Date(), new Date(dataInicio)) : 0;
  const diasTotais = dataInicio && dataFim ? differenceInDays(new Date(dataFim), new Date(dataInicio)) : 1;
  const cronogramaPercentual = Math.min(100, Math.max(0, Math.round((diasDecorridos / diasTotais) * 100)));
  const cronogramaLabel = `${Math.max(0, diasDecorridos)}/${diasTotais} dias (${cronogramaPercentual}%)`;

  const cards = [
    {
      label: "Progresso Geral",
      value: `${progressoGeral}%`,
    },
    {
      label: "Roadmap",
      value: etapaAtualNumero ? `Fase ${etapaAtualNumero}` : "—",
    },
    {
      label: "Cronograma",
      value: cronogramaLabel,
    },
    {
      label: "Entregas",
      value: `${entregasConcluidas}/${totalEntregas}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="py-5 px-3 flex flex-col items-center text-center space-y-1.5">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{card.label}</span>
            <p className="text-sm font-semibold truncate max-w-full">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
