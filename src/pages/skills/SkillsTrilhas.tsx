import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSkillsTrilhas } from "@/hooks/useSkillsTrilhas";
import { BookOpen, Layers, Calendar, ArrowRight, Loader2, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SkillsTrilhas() {
  const { data: conteudos, isLoading, error } = useSkillsTrilhas();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Erro ao carregar conteúdos: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trilhas = conteudos?.filter(c => c.trilha) || [];
  const modulos = conteudos?.filter(c => c.modulo) || [];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Trilhas Skills</h1>
        <p className="text-muted-foreground mt-1">
          Conteúdos direcionados para sua equipe baseados no diagnóstico
        </p>
      </div>

      {/* Empty State */}
      {(!conteudos || conteudos.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum conteúdo liberado ainda</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Aguarde a liberação de conteúdos pela sua empresa ou mentor.
              Eles serão direcionados com base no diagnóstico da sua equipe.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trilhas Section */}
      {trilhas.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Trilhas Liberadas</h2>
            <Badge variant="secondary">{trilhas.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trilhas.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/trilhas/${item.trilha?.id}`)}
              >
                {item.trilha?.imagem_url && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={item.trilha.imagem_url}
                      alt={item.trilha.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                      {item.trilha?.titulo}
                    </CardTitle>
                    {item.fase_roadmap && (
                      <Badge variant="outline" className="shrink-0">
                        <Calendar className="h-3 w-3 mr-1" />
                        Sem. {item.fase_roadmap.semana_inicio}-{item.fase_roadmap.semana_fim}
                      </Badge>
                    )}
                  </div>
                  {item.trilha?.descricao && (
                    <CardDescription className="line-clamp-2">
                      {item.trilha.descricao}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {item.motivo || "manual"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Acessar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Módulos Section */}
      {modulos.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Módulos Específicos</h2>
            <Badge variant="secondary">{modulos.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modulos.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/trilhas/${item.modulo?.trilha_id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {(item.modulo as any)?.trilhas?.titulo || "Trilha"}
                      </p>
                      <CardTitle className="text-base line-clamp-2">
                        {item.modulo?.titulo}
                      </CardTitle>
                    </div>
                    {item.fase_roadmap && (
                      <Badge variant="outline" className="shrink-0">
                        <Calendar className="h-3 w-3 mr-1" />
                        Sem. {item.fase_roadmap.semana_inicio}-{item.fase_roadmap.semana_fim}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {item.motivo || "manual"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Acessar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
