import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, ExternalLink, MessageSquare, Sparkles, Wrench } from "lucide-react";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface FerramentaProjeto {
  nome: string;
  uso_no_projeto: string;
}

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
        {projetosSugeridos.map((projeto) => {
          const temFeedback = projeto.comentarios_mentor || projeto.devolutiva_mentor;
          const ferramentas = ((projeto as any).ferramentas_projeto as FerramentaProjeto[] | null) || [];

          return (
            <div
              key={projeto.id}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-foreground">{projeto.titulo}</h4>
                <div className="flex gap-2">
                  {temFeedback && (
                    <Badge variant="default" className="bg-primary/90 animate-pulse">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Nova dica!
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    Sugerido
                  </Badge>
                </div>
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

              {/* Ferramentas do Projeto */}
              {ferramentas.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2 text-accent font-medium text-sm mb-2">
                    <Wrench className="h-4 w-4" />
                    Ferramentas para Dominar
                  </div>
                  <div className="space-y-2">
                    {ferramentas.map((tool, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-background shrink-0">
                          {tool.nome}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{tool.uso_no_projeto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback da mentora */}
              {temFeedback && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    <MessageSquare className="h-4 w-4" />
                    Feedback da Mentora
                  </div>
                  {projeto.comentarios_mentor && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Dicas:</span>
                      <p className="text-sm mt-1">{projeto.comentarios_mentor}</p>
                    </div>
                  )}
                  {projeto.devolutiva_mentor && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Devolutiva:</span>
                      <p className="text-sm mt-1">{projeto.devolutiva_mentor}</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate("/mentoria/projetos")}
              >
                Ver Detalhes <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
