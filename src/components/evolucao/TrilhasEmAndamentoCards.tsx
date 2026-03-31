import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Video, ChevronRight } from "lucide-react";
import { useTrilhasEmAndamento } from "@/hooks/useEvolucao";
import { useNavigate } from "react-router-dom";

export function TrilhasEmAndamentoCards() {
  const { data: trilhas, isLoading } = useTrilhasEmAndamento();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-aplicada-green-900/20">
        <CardHeader>
          <CardTitle className="text-xl">Trilhas em Andamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!trilhas || trilhas.length === 0) {
    return (
      <Card className="border-aplicada-green-900/20">
        <CardHeader>
          <CardTitle className="text-xl">Trilhas em Andamento</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Você ainda não iniciou nenhuma trilha.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/trilhas")}
          >
            Explorar Trilhas
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <CardTitle className="text-xl">Trilhas em Andamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trilhas.map((trilha) => {
          const videosRestantes = trilha.totalVideos - trilha.videosCompletos;
          const progresso = trilha.progressoPercent || 0;

          return (
            <Card
              key={trilha.id}
              className="border-aplicada-green-900/20 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/trilhas/${trilha.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                  {/* Imagem da trilha */}
                  {trilha.imagem_url && (
                    <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={trilha.imagem_url}
                        alt={trilha.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {trilha.titulo}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>
                        Faltam {videosRestantes} vídeo{videosRestantes !== 1 ? "s" : ""} para o certificado
                      </span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">
                          {progresso.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progresso} className="h-1.5" />
                    </div>
                  </div>

                  {/* Botão de ação */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/trilhas/${trilha.id}`);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
