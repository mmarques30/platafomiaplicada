import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, FileText, Lightbulb, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useConteudosDashboard } from "@/hooks/useConteudosDashboard";

interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  url: string;
  arquivos_url: unknown;
  created_at: string;
}

export function FreeMateriaisDicas() {
  // Buscar materiais gratuitos visíveis para usuários gratuitos
  const { data: materiais, isLoading: loadingMateriais } = useQuery({
    queryKey: ['materiais-gratuitos-free'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais_gratuitos')
        .select('*')
        .eq('ativo', true)
        .eq('visivel_gratuitos', true)
        .eq('categoria', 'materiais_aula')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data as Material[];
    },
  });

  // Buscar dicas práticas
  const { data: dicas, isLoading: loadingDicas } = useConteudosDashboard('dica', true);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Materiais das Aulas */}
        <div className="bg-card rounded-xl border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Materiais das Aulas</h3>
          </div>

          {loadingMateriais ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : materiais && materiais.length > 0 ? (
            <div className="space-y-3">
              {materiais.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{material.titulo}</h4>
                    {material.descricao && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {material.descricao}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 ml-2"
                    asChild
                  >
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhum material disponível no momento.
            </div>
          )}
        </div>

        {/* Coluna 2: Dicas Práticas */}
        <div className="bg-card rounded-xl border p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Dicas Práticas</h3>
          </div>

          {loadingDicas ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : dicas && dicas.length > 0 ? (
            <div className="space-y-3">
              {dicas.slice(0, 4).map((dica) => (
                <div
                  key={dica.id}
                  className="p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => {
                    if (dica.link_externo) {
                      window.open(dica.link_externo, '_blank');
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {dica.destaque && (
                        <Badge variant="secondary" className="mb-1.5 text-xs bg-yellow-500/10 text-yellow-600">
                          Destaque
                        </Badge>
                      )}
                      <h4 className="font-medium text-sm line-clamp-1">{dica.titulo}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {dica.resumo}
                      </p>
                    </div>
                    {dica.link_externo && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(dica.created_at), "dd MMM yyyy", { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhuma dica disponível no momento.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
