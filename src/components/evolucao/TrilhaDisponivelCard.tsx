import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";

interface TrilhaDisponivelCardProps {
  id: string;
  titulo: string;
  descricao?: string;
  nivel: string;
  categoria: string;
  duracaoEstimada?: number;
  totalVideos: number;
}

export function TrilhaDisponivelCard({
  id,
  titulo,
  descricao,
  nivel,
  categoria,
  duracaoEstimada,
  totalVideos,
}: TrilhaDisponivelCardProps) {
  const navigate = useNavigate();

  const formatDuracao = (minutos?: number) => {
    if (!minutos) return "Duração não informada";
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case "iniciante":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "intermediario":
      case "intermediário":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "avancado":
      case "avançado":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="hover:shadow-md hover:bg-accent/50 transition-all">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <Badge className={getNivelColor(nivel)}>{nivel}</Badge>
            <span className="text-sm text-muted-foreground">
              {categoria} • {formatDuracao(duracaoEstimada)} • {totalVideos} aulas
            </span>
          </div>
          {descricao && (
            <p className="text-sm text-muted-foreground line-clamp-1">{descricao}</p>
          )}
        </div>
        
        <Button
          className="flex-shrink-0"
          onClick={() => navigate(`/trilhas/${id}`)}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Iniciar trilha
        </Button>
      </CardContent>
    </Card>
  );
}
