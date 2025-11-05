import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  totalTrilhas: number;
  trilhasConcluidas: number;
  percentualConclusao: number;
  tempoTotal: number;
  sequencia: number;
  totalCertificados: number;
}

export function ProgressCard({
  totalTrilhas,
  trilhasConcluidas,
  percentualConclusao,
  tempoTotal,
  sequencia,
  totalCertificados,
}: ProgressCardProps) {
  const formatTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas}h ${minutos}min`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sora-medium text-card-foreground">Seu Progresso Geral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-sora-regular text-card-foreground">
              Trilhas concluídas: {trilhasConcluidas}/{totalTrilhas} ({percentualConclusao}%)
            </span>
          </div>
          <Progress value={percentualConclusao} className="h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <p className="text-sm font-sora-light text-card-foreground/70">Horas de estudo</p>
            <p className="text-2xl font-sora-semibold text-card-foreground">{formatTempo(tempoTotal)}</p>
          </div>
          <div>
            <p className="text-sm font-sora-light text-card-foreground/70">Sequência atual</p>
            <p className="text-2xl font-sora-semibold text-card-foreground">{sequencia} dias</p>
          </div>
          <div>
            <p className="text-sm font-sora-light text-card-foreground/70">Certificados</p>
            <p className="text-2xl font-sora-semibold text-card-foreground">{totalCertificados}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
