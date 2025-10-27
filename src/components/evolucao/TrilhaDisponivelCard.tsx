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
        // Verde 500 - Claro e acolhedor
        return "bg-[#BCC95D]/10 text-[#BCC95D] dark:text-[#C8D27B]";
      case "intermediario":
      case "intermediário":
        // Verde 700 - Primário (cor principal da marca)
        return "bg-[#9EB038]/10 text-[#9EB038] dark:text-[#AFC040]";
      case "avancado":
      case "avançado":
        // Verde 900 - Escuro e profissional
        return "bg-[#738925]/10 text-[#738925] dark:text-[#889C2D]";
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
