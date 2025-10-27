import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";

interface TrilhaEmAndamentoCardProps {
  id: string;
  titulo: string;
  progressoPercent: number;
  videosCompletos: number;
  totalVideos: number;
  ultimaVisualizacao?: string;
  proximoVideo?: string;
  proximoVideoId?: string;
  duracaoEstimada?: number;
}

export function TrilhaEmAndamentoCard({
  id,
  titulo,
  progressoPercent,
  videosCompletos,
  totalVideos,
  ultimaVisualizacao,
  proximoVideo,
  proximoVideoId,
  duracaoEstimada,
}: TrilhaEmAndamentoCardProps) {
  const navigate = useNavigate();

  const formatTempoRestante = (duracao?: number, completos?: number, total?: number) => {
    if (!duracao || !completos || !total) return "~1h";
    const minutosRestantes = Math.round((duracao * (total - completos)) / total);
    const horas = Math.floor(minutosRestantes / 60);
    const minutos = minutosRestantes % 60;
    return `~${horas}h ${minutos}min`;
  };

  const formatUltimaAtividade = (data?: string) => {
    if (!data) return "Nunca";
    const diff = Date.now() - new Date(data).getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Ontem";
    return `Há ${dias} dias`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">➥ {titulo}</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progresso: {progressoPercent}%</span>
            </div>
            <Progress value={progressoPercent} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Aulas concluídas</p>
              <p className="font-semibold">
                {videosCompletos}/{totalVideos}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tempo restante</p>
              <p className="font-semibold">
                {formatTempoRestante(duracaoEstimada, videosCompletos, totalVideos)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Última atividade</p>
              <p className="font-semibold">{formatUltimaAtividade(ultimaVisualizacao)}</p>
            </div>
          </div>

          {proximoVideo && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Próxima aula:</p>
              <p className="font-medium text-sm">{proximoVideo}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                if (proximoVideoId) {
                  navigate(`/video/${proximoVideoId}`);
                } else {
                  navigate(`/trilhas/${id}`);
                }
              }}
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/trilhas/${id}`)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
