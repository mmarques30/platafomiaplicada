import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/button";
import { useProgressoCertificados } from "@/hooks/useProgressoCertificados";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export function ProgressoCertificados() {
  const { data: progresso, isLoading } = useProgressoCertificados();
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

  if (!progresso || progresso.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Progresso para Certificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comece a assistir as trilhas para acompanhar seu progresso aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Progresso para Certificados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progresso.map((trilha: any) => (
          <div key={trilha.trilhaId} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{trilha.titulo}</p>
                <span className="text-sm font-semibold text-primary">
                  {trilha.percentual}%
                </span>
              </div>
              <ProgressBar value={trilha.percentual} height={8} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Faltam: {trilha.faltamVideos} {trilha.faltamVideos === 1 ? 'vídeo' : 'vídeos'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/trilhas/${trilha.trilhaId}`)}
              >
                Continuar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
