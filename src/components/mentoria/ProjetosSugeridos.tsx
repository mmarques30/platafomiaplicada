import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ExternalLink } from "lucide-react";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export function ProjetosSugeridos() {
  const { projetos, isLoading } = useMentoriaProjetos();
  const navigate = useNavigate();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const projetosSugeridos = projetos?.filter(
    (p) => p.status === "planejamento" && p.tipo === "operacional"
  );

  if (!projetosSugeridos || projetosSugeridos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Lightbulb className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum projeto sugerido</h3>
          <p className="text-muted-foreground text-center">
            Complete o diagnóstico para receber sugestões de projetos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Projetos Sugeridos pela IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projetosSugeridos.map((projeto) => (
          <div
            key={projeto.id}
            className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-foreground">{projeto.titulo}</h4>
              <Badge variant="secondary" className="text-xs">
                Sugerido
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{projeto.descricao}</p>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <strong>Objetivo:</strong> {projeto.objetivo_projeto}
              </p>
              <p className="text-foreground">
                <strong>Contribuição:</strong> {projeto.contribuicao_plano}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate("/mentoria/projetos")}
            >
              Ver Detalhes <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}