import { useParams, useNavigate } from "react-router-dom";
import { useEtapaById } from "@/hooks/useEtapasBusiness";
import { useEntregasByEtapa, EntregaBusiness } from "@/hooks/useEntregasBusiness";
import { EtapaHeader } from "@/components/mentoria/business/EtapaHeader";
import { MarcosEtapa } from "@/components/mentoria/business/MarcosEtapa";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Target, Package, Clock, PlayCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", icon: Clock, variant: "secondary" as const, color: "text-muted-foreground" },
  em_andamento: { label: "Em Andamento", icon: PlayCircle, variant: "default" as const, color: "text-amber-600" },
  concluida: { label: "Concluída", icon: CheckCircle2, variant: "outline" as const, color: "text-green-600" },
  cancelada: { label: "Cancelada", icon: AlertCircle, variant: "destructive" as const, color: "text-destructive" },
};

const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", variant: "secondary" as const },
  media: { label: "Média", variant: "default" as const },
  alta: { label: "Alta", variant: "destructive" as const },
  urgente: { label: "Urgente", variant: "destructive" as const },
};

export default function MentoriaEtapa() {
  const { etapaId } = useParams<{ etapaId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: etapa, isLoading: loadingEtapa } = useEtapaById(etapaId);
  const { data: entregas, isLoading: loadingEntregas } = useEntregasByEtapa(etapaId);

  // Mutation para atualizar status da entrega
  const updateEntrega = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EntregaBusiness['status'] }) => {
      const { error } = await supabase
        .from("entregas_business")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas-by-etapa", etapaId] });
      toast.success("Entrega atualizada");
    },
    onError: () => {
      toast.error("Erro ao atualizar entrega");
    },
  });

  const handleStatusChange = (entregaId: string, newStatus: EntregaBusiness['status']) => {
    updateEntrega.mutate({ id: entregaId, status: newStatus });
  };

  // Calcular progresso
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
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!etapa) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-muted-foreground">Etapa não encontrada</p>
      </div>
    );
  }

  const renderEntregaCard = (entrega: EntregaBusiness) => {
    const statusConfig = STATUS_CONFIG[entrega.status];
    const prioridadeConfig = PRIORIDADE_CONFIG[entrega.prioridade] ?? PRIORIDADE_CONFIG.media;
    const StatusIcon = statusConfig.icon;

    return (
      <Card 
        key={entrega.id} 
        className={cn(
          "border-l-4 transition-all",
          entrega.status === 'concluida' && "border-l-green-500 bg-green-50/30 dark:bg-green-950/10",
          entrega.status === 'em_andamento' && "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10",
          entrega.status === 'pendente' && "border-l-muted-foreground/30",
          entrega.status === 'cancelada' && "border-l-destructive opacity-60"
        )}
      >
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
                <h3 className={cn(
                  "font-semibold text-lg",
                  entrega.status === 'concluida' && "line-through text-muted-foreground"
                )}>
                  {entrega.numero_entrega ? `Entrega ${entrega.numero_entrega}: ` : ''}
                  {entrega.titulo}
                </h3>
                <Badge variant={prioridadeConfig.variant} className="text-xs">
                  {prioridadeConfig.label}
                </Badge>
              </div>
              
              {entrega.descricao && (
                <p className="text-sm text-muted-foreground mb-3">
                  {entrega.descricao}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {entrega.modulo_relacionado && (
                  <span className="bg-muted px-2 py-1 rounded-md">
                    {entrega.modulo_relacionado}
                  </span>
                )}
                {entrega.prazo_previsto && (
                  <span className="bg-muted px-2 py-1 rounded-md">
                    Prazo: {format(parseISO(entrega.prazo_previsto), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
            
            {/* Status Selector */}
            <div className="flex items-center gap-2 lg:min-w-[180px]">
              <Select
                value={entrega.status}
                onValueChange={(value) => handleStatusChange(entrega.id, value as EntregaBusiness['status'])}
                disabled={updateEntrega.isPending}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  entrega.status === 'concluida' && "border-green-500 text-green-600",
                  entrega.status === 'em_andamento' && "border-amber-500 text-amber-600"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", config.color)} />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/mentoria/etapas-business")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <EtapaHeader etapa={etapa} />
        </div>
      </div>

      {/* Objetivo da Etapa */}
      {etapa.objetivo && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Objetivo desta Fase</p>
                <p className="text-sm text-muted-foreground mt-1">{etapa.objetivo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso Geral das Entregas */}
      {entregas && entregas.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso das Entregas</span>
              <span className="text-sm text-muted-foreground">
                {entregas.filter(e => e.status === 'concluida').length}/{entregas.length} entregas
              </span>
            </div>
            <Progress value={progressoGeral} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Lista de Entregas */}
      {entregas && entregas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Entregas desta Fase ({entregas.length})
          </h2>
          <div className="space-y-3">
            {entregas
              .sort((a, b) => (a.numero_entrega || 0) - (b.numero_entrega || 0))
              .map(renderEntregaCard)}
          </div>
        </div>
      )}

      <MarcosEtapa marcos={etapa.marcos_proxima_etapa} />

      {(!entregas || entregas.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhuma entrega cadastrada para esta fase.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
