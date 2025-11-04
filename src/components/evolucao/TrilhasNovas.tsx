import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useTrilhasNovas } from "@/hooks/useTrilhasNovas";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function TrilhasNovas() {
  const { data: trilhas, isLoading } = useTrilhasNovas();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trilhas || trilhas.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Trilhas Novas Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trilhas.map((trilha: any) => {
          const videoCount = Array.isArray(trilha.videos) ? trilha.videos.length : trilha.videos?.[0]?.count || 0;
          const dataFormatada = formatDistanceToNow(new Date(trilha.created_at), {
            addSuffix: true,
            locale: ptBR,
          });

          return (
            <div
              key={trilha.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{trilha.titulo}</p>
                <p className="text-sm text-muted-foreground">
                  {videoCount} {videoCount === 1 ? 'vídeo' : 'vídeos'} • Adicionada {dataFormatada}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/trilhas/${trilha.id}`)}
              >
                Ver Trilha
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
