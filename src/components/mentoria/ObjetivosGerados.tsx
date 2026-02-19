import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Clock, Calendar } from "lucide-react";
import { useObjetivos } from "@/hooks/useObjetivos";
import { Skeleton } from "@/components/ui/skeleton";

export function ObjetivosGerados() {
  const { objetivos, isLoading } = useObjetivos();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "curto_prazo":
        return <Clock className="h-4 w-4" />;
      case "medio_prazo":
        return <Calendar className="h-4 w-4" />;
      case "longo_prazo":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "curto_prazo":
        return "Curto Prazo";
      case "medio_prazo":
        return "Médio Prazo";
      case "longo_prazo":
        return "Longo Prazo";
      default:
        return tipo;
    }
  };

  if (!objetivos || objetivos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum objetivo gerado</h3>
          <p className="text-muted-foreground text-center">
            Complete o diagnóstico para gerar objetivos personalizados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Objetivos Estratégicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {objetivos.map((objetivo) => (
          <div
            key={objetivo.id}
            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTipoIcon(objetivo.tipo)}
                <Badge variant="outline">{getTipoLabel(objetivo.tipo)}</Badge>
              </div>
              <Badge variant="secondary" className="text-xs">
                Diagnóstico
              </Badge>
            </div>
            <p className="text-foreground">{objetivo.objetivo}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}