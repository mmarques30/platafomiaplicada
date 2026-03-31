import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessProgressoConteudo } from "@/hooks/useBusinessProgressoConteudo";
import { Video, FileText, MousePointerClick, Clock, CheckCircle, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessProgressoConteudo() {
  const { data, isLoading } = useBusinessProgressoConteudo();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-primary/20">
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
        <Card className="border-primary/20">
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
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Videos */}
        <Card className="border-primary/20 bg-gradient-to-br from-blue-500/5 to-transparent">
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
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTempo(data?.videos.tempoTotalMinutos || 0)} assistidos
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {data?.videos.percentualConcluido || 0}% concluídos
              </div>
              {data?.videos.ultimoAcesso && (
                <div className="text-xs mt-1">
                  Último: {formatDate(data.videos.ultimoAcesso)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prompts */}
        <Card className="border-primary/20 bg-gradient-to-br from-green-500/5 to-transparent">
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
              {data?.prompts.ultimos && data.prompts.ultimos.length > 0 ? (
                <div className="space-y-1">
                  {data.prompts.ultimos.slice(0, 2).map((p, i) => (
                    <div key={i} className="truncate text-xs">
                      • {p.titulo}
                    </div>
                  ))}
                </div>
              ) : (
                <span>Nenhum prompt copiado</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interações */}
        <Card className="border-primary/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <MousePointerClick className="h-4 w-4 text-purple-500" />
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

      {/* Atividade Recente */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.interacoes.atividadeRecente && data.interacoes.atividadeRecente.length > 0 ? (
            <div className="space-y-3">
              {data.interacoes.atividadeRecente.map((atividade, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(atividade.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {atividade.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(atividade.data)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma atividade registrada ainda</p>
              <p className="text-sm mt-1">
                Comece a assistir vídeos e usar prompts para ver seu progresso aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
