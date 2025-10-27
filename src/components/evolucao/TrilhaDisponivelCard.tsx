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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold">{titulo}</h3>
              <Badge className={getNivelColor(nivel)}>{nivel}</Badge>
            </div>
            {descricao && (
              <p className="text-sm text-muted-foreground line-clamp-2">{descricao}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>📚 {categoria}</span>
            <span>•</span>
            <span>{formatDuracao(duracaoEstimada)}</span>
            <span>•</span>
            <span>{totalVideos} aulas</span>
          </div>

          <Button
            className="w-full"
            onClick={() => navigate(`/trilhas/${id}`)}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Iniciar trilha
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
