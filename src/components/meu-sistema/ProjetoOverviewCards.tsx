import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays } from "date-fns";

interface ProjetoOverviewCardsProps {
  etapaAtualNumero: number | null;
  dataInicio: string | null;
  dataFim: string | null;
  entregasConcluidas: number;
  totalEntregas: number;
}

export function ProjetoOverviewCards({
  etapaAtualNumero,
  dataInicio,
  dataFim,
  entregasConcluidas,
  totalEntregas,
}: ProjetoOverviewCardsProps) {
  const diasDecorridos = dataInicio ? differenceInDays(new Date(), new Date(dataInicio)) : 0;
  const diasTotais = dataInicio && dataFim ? differenceInDays(new Date(dataFim), new Date(dataInicio)) : 1;
  const cronogramaPercentual = Math.min(100, Math.max(0, Math.round((diasDecorridos / diasTotais) * 100)));

  const progressoEntregas = totalEntregas > 0 ? (entregasConcluidas / totalEntregas) * 100 : 0;

  let saude: { label: string; color: string };
  if (progressoEntregas > cronogramaPercentual + 10) {
    saude = { label: "Avançado", color: "text-blue-500" };
  } else if (progressoEntregas >= cronogramaPercentual) {
    saude = { label: "Saudável", color: "text-green-500" };
  } else {
    saude = { label: "Em Risco", color: "text-destructive" };
  }

  const cards = [
    {
      label: "Saúde do Projeto",
      value: saude.label,
      color: saude.color,
    },
    {
      label: "Roadmap",
      value: etapaAtualNumero ? `Fase ${etapaAtualNumero}` : "—",
    },
    {
      label: "Cronograma",
      value: `${cronogramaPercentual}%`,
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
            <p className={`text-sm font-semibold truncate max-w-full ${"color" in card ? card.color : ""}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
