import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Video, ChevronRight } from "lucide-react";
import { useTrilhasEmAndamento } from "@/hooks/useEvolucao";
import { useNavigate } from "react-router-dom";

function Header({ action }: { action?: React.ReactNode }) {
  return (
    <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="font-serif-display text-2xl font-normal">
        Trilhas <em className="font-serif-italic text-primary">em andamento</em>
      </CardTitle>
      {action}
    </CardHeader>
  );
}

export function TrilhasEmAndamentoCards() {
  const { data: trilhas, isLoading } = useTrilhasEmAndamento();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <Header />
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!trilhas || trilhas.length === 0) {
    return (
      <Card>
        <Header />
        <CardContent>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">Você ainda não iniciou nenhuma trilha.</p>
            <Button size="pill" onClick={() => navigate("/trilhas")}>
              Explorar trilhas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Header
        action={
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate("/trilhas")}>
            Ver todas
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        }
      />
      <CardContent className="space-y-3">
        {trilhas.map((trilha) => {
          const videosRestantes = trilha.totalVideos - trilha.videosCompletos;
          const progresso = trilha.progressoPercent || 0;

          return (
            <button
              key={trilha.id}
              type="button"
              className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 sm:p-4"
              onClick={() => navigate(`/trilhas/${trilha.id}`)}
            >
              {trilha.imagem_url ? (
                <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                  <img src={trilha.imagem_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-primary sm:flex">
                  <Video className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-foreground">{trilha.titulo}</h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Video className="h-3.5 w-3.5" />
                  Faltam {videosRestantes} vídeo{videosRestantes !== 1 ? "s" : ""} para o certificado
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar value={progresso} height={6} />
                  </div>
                  <span className="w-10 text-right text-xs font-medium text-foreground">{progresso.toFixed(0)}%</span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
