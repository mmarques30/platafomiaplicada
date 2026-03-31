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
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="font-bold text-foreground text-xl">Progresso Geral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-base font-semibold mb-3 text-foreground">Conclusão de Trilhas</h3>
          <div className="flex items-center gap-3">
            <Progress value={percentualConclusao} className="flex-1 h-3" />
            <span className="text-base text-primary font-bold min-w-[3rem] text-right">
              {percentualConclusao}%
            </span>
          </div>
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
