import { useParams, useNavigate } from "react-router-dom";
import { useEtapaById } from "@/hooks/useEtapasBusiness";
import { useEntregasByEtapa } from "@/hooks/useEntregasBusiness";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, CheckCircle2, Clock, PlayCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", icon: Clock, color: "text-muted-foreground", borderColor: "border-l-muted-foreground/30" },
  em_andamento: { label: "Em Andamento", icon: PlayCircle, color: "text-amber-600", borderColor: "border-l-amber-500" },
  concluida: { label: "Concluída", icon: CheckCircle2, color: "text-green-600", borderColor: "border-l-green-500" },
  cancelada: { label: "Cancelada", icon: AlertCircle, color: "text-destructive", borderColor: "border-l-destructive" },
};

const ETAPA_STATUS = {
  concluida: { label: "Concluída", variant: "default" as const },
  em_andamento: { label: "Em Andamento", variant: "secondary" as const },
  pendente: { label: "Pendente", variant: "outline" as const },
};

export default function MeuSistemaEtapaDetalhe() {
  const { etapaId } = useParams<{ etapaId: string }>();
  const navigate = useNavigate();
  const { data: etapa, isLoading: loadingEtapa } = useEtapaById(etapaId);
  const { data: entregas, isLoading: loadingEntregas } = useEntregasByEtapa(etapaId);

  const calcularProgresso = () => {
    if (!entregas || entregas.length === 0) return 0;
    const concluidas = entregas.filter(e => e.status === 'concluida').length;
    return Math.round((concluidas / entregas.length) * 100);
  };

  const progressoGeral = calcularProgresso();

  if (loadingEtapa || loadingEntregas) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!etapa) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-muted-foreground">Etapa não encontrada</p>
        <Button variant="ghost" onClick={() => navigate("/meu-sistema")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const statusEtapa = ETAPA_STATUS[etapa.status] || ETAPA_STATUS.pendente;

  // Calcular duração estimada
  const duracaoDias = etapa.data_prevista && etapa.data_conclusao
    ? differenceInDays(parseISO(etapa.data_conclusao), parseISO(etapa.data_prevista))
    : null;

  const marcos = etapa.marcos_proxima_etapa as string[] | null;

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/meu-sistema")}
          className="mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">Etapa {etapa.numero_etapa}</p>
          <h1 className="text-2xl font-bold">{etapa.titulo}</h1>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant={statusEtapa.variant}>{statusEtapa.label}</Badge>
            {etapa.data_prevista && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Prevista: {format(parseISO(etapa.data_prevista), "dd MMM yyyy", { locale: ptBR })}
              </span>
            )}
            {etapa.data_conclusao && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Concluída: {format(parseISO(etapa.data_conclusao), "dd MMM yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sobre esta Fase */}
      {etapa.objetivo && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Sobre esta Fase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{etapa.objetivo}</p>
          </CardContent>
        </Card>
      )}

      {/* Projeção de Execução */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Projeção de Execução
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {etapa.data_prevista && (
              <div>
                <p className="text-xs text-muted-foreground">Data Prevista</p>
                <p className="text-sm font-medium">
                  {format(parseISO(etapa.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
            {etapa.data_conclusao && (
              <div>
                <p className="text-xs text-muted-foreground">Data de Conclusão</p>
                <p className="text-sm font-medium">
                  {format(parseISO(etapa.data_conclusao), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
            {duracaoDias !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="text-sm font-medium">{duracaoDias} dias</p>
              </div>
            )}
          </div>

          {entregas && entregas.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso das Entregas</span>
                <span className="font-medium">
                  {entregas.filter(e => e.status === 'concluida').length}/{entregas.length} ({progressoGeral}%)
                </span>
              </div>
              <Progress value={progressoGeral} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impacto e Necessidade */}
      {marcos && marcos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Impacto e Necessidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {marcos.map((marco, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{marco}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Entregas Previstas (somente leitura) */}
      {entregas && entregas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">
            Entregas Previstas ({entregas.length})
          </h2>
          <div className="space-y-2">
            {entregas
              .sort((a, b) => (a.numero_entrega || 0) - (b.numero_entrega || 0))
              .map((entrega) => {
                const cfg = STATUS_CONFIG[entrega.status] || STATUS_CONFIG.pendente;
                const Icon = cfg.icon;
                return (
                  <Card key={entrega.id} className={cn("border-l-4", cfg.borderColor)}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium",
                            entrega.status === 'concluida' && "line-through text-muted-foreground"
                          )}>
                            {entrega.titulo}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {entrega.modulo_relacionado && (
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {entrega.modulo_relacionado}
                              </span>
                            )}
                            {entrega.prazo_previsto && (
                              <span className="text-xs text-muted-foreground">
                                Prazo: {format(parseISO(entrega.prazo_previsto), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {cfg.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {(!entregas || entregas.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma entrega cadastrada para esta fase.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
