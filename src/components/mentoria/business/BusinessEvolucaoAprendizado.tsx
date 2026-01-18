import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessEvolucaoAprendizado, AtividadeItem } from "@/hooks/useBusinessEvolucaoAprendizado";
import { Video, FileText, MousePointerClick, ChevronDown, ChevronUp, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

type FiltroTopico = "todos" | "video" | "prompt" | "acesso";
type FiltroFavorito = "todos" | "favoritos";

export function BusinessEvolucaoAprendizado() {
  const { data, isLoading } = useBusinessEvolucaoAprendizado();
  
  const [filtroTopico, setFiltroTopico] = useState<FiltroTopico>("todos");
  const [filtroTipoConteudo, setFiltroTipoConteudo] = useState<string>("todos");
  const [filtroFavorito, setFiltroFavorito] = useState<FiltroFavorito>("todos");
  const [expandido, setExpandido] = useState(false);

  // Tipos de conteúdo únicos para o filtro
  const tiposConteudo = useMemo(() => {
    if (!data?.atividades) return [];
    const tipos = new Set<string>();
    data.atividades.forEach(a => {
      if (a.tipoConteudo) tipos.add(a.tipoConteudo);
    });
    return Array.from(tipos);
  }, [data?.atividades]);

  // Filtrar atividades
  const atividadesFiltradas = useMemo(() => {
    if (!data?.atividades) return [];
    
    return data.atividades.filter(atividade => {
      // Filtro por tópico
      if (filtroTopico !== "todos" && atividade.tipo !== filtroTopico) {
        return false;
      }
      
      // Filtro por tipo de conteúdo
      if (filtroTipoConteudo !== "todos" && atividade.tipoConteudo !== filtroTipoConteudo) {
        return false;
      }
      
      // Filtro por favoritos
      if (filtroFavorito === "favoritos" && !data.favoritos.includes(atividade.itemId)) {
        return false;
      }
      
      return true;
    });
  }, [data?.atividades, data?.favoritos, filtroTopico, filtroTipoConteudo, filtroFavorito]);

  // Atividades a exibir (3 ou todas)
  const atividadesExibidas = expandido ? atividadesFiltradas : atividadesFiltradas.slice(0, 3);
  const temMaisAtividades = atividadesFiltradas.length > 3;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTempo = (minutos: number) => {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
  };

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "prompt":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "acesso":
        return <MousePointerClick className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const isFavorito = (itemId: string) => {
    return data?.favoritos.includes(itemId);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas - Simplificados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Videos */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vídeos Assistidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data?.videos.total || 0}
            </div>
            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
              <div>{formatTempo(data?.videos.tempoTotalMinutos || 0)} assistidos</div>
              <div>{data?.videos.percentualConcluido || 0}% concluídos</div>
            </div>
          </CardContent>
        </Card>

        {/* Prompts */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prompts Consumidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {data?.prompts.total || 0}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Prompts copiados e utilizados
            </div>
          </CardContent>
        </Card>

        {/* Interações */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {(data?.interacoes.totalAcessos || 0) + (data?.interacoes.totalCliques || 0)}
            </div>
            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
              <div>{data?.interacoes.totalAcessos || 0} acessos a conteúdos</div>
              <div>{data?.interacoes.totalCliques || 0} cliques rastreados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente com Filtros */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Atividade Recente
          </CardTitle>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Select value={filtroTopico} onValueChange={(v) => setFiltroTopico(v as FiltroTopico)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Tópico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="video">Vídeos</SelectItem>
                <SelectItem value="prompt">Prompts</SelectItem>
                <SelectItem value="acesso">Acessos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroTipoConteudo} onValueChange={setFiltroTipoConteudo}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposConteudo.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroFavorito} onValueChange={(v) => setFiltroFavorito(v as FiltroFavorito)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Favoritos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="favoritos">⭐ Favoritos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {atividadesFiltradas.length > 0 ? (
            <div className="space-y-2">
              {atividadesExibidas.map((atividade) => (
                <div
                  key={atividade.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(atividade.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {atividade.descricao}
                      </p>
                      {isFavorito(atividade.itemId) && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{atividade.tipoConteudo}</span>
                      <span>•</span>
                      <span>{formatDate(atividade.data)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Botão Expandir/Retrair */}
              {temMaisAtividades && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setExpandido(!expandido)}
                >
                  {expandido ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Retrair
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expandir ({atividadesFiltradas.length - 3} mais)
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma atividade encontrada</p>
              <p className="text-sm mt-1">
                {filtroTopico !== "todos" || filtroTipoConteudo !== "todos" || filtroFavorito !== "todos"
                  ? "Tente ajustar os filtros"
                  : "Comece a assistir vídeos e usar prompts para ver seu progresso aqui"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
