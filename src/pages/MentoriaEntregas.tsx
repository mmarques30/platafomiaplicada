import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEntregasBusiness, EntregaBusiness } from "@/hooks/useEntregasBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  critica: { label: "Crítica", variant: "destructive" as const },
};

export default function MentoriaEntregas() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness(businessUserId);
  const { entregas, entregasAtivas, entregasBacklog, isLoading: isLoadingEntregas, updateEntrega } = useEntregasBusiness(contrato?.id);
  const { data: etapas } = useEtapasBusiness(contrato?.id);

  const isLoading = isLoadingContrato || isLoadingEntregas;

  const getEtapaNome = (etapaId?: string) => {
    if (!etapaId || !etapas) return null;
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa ? `Fase ${etapa.numero_etapa}: ${etapa.titulo}` : null;
  };

  const handleStatusChange = (entregaId: string, newStatus: EntregaBusiness['status']) => {
    updateEntrega.mutate({ id: entregaId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-48" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum contrato ativo encontrado. As entregas serão exibidas após a configuração do seu contrato.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Entregas do Projeto</h1>
          <p className="text-sm text-muted-foreground">
            {entregas.length} entrega{entregas.length !== 1 ? 's' : ''} no total
          </p>
        </div>
      </div>

      {entregas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma entrega cadastrada ainda. Aguarde a configuração pelo administrador.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Entregas Ativas */}
          {entregasAtivas.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Entregas Ativas ({entregasAtivas.length})</h2>
              <div className="grid gap-4">
                {entregasAtivas.map((entrega) => {
                  const statusConfig = STATUS_CONFIG[entrega.status];
                  const prioridadeConfig = PRIORIDADE_CONFIG[entrega.prioridade];
                  const StatusIcon = statusConfig.icon;
                  const etapaNome = getEtapaNome(entrega.etapa_id);

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
                              {etapaNome && (
                                <span className="bg-muted px-2 py-1 rounded-md">
                                  {etapaNome}
                                </span>
                              )}
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
                })}
              </div>
            </div>
          )}

          {/* Entregas Backlog/Futuras */}
          {entregasBacklog.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                Backlog / Futuras ({entregasBacklog.length})
              </h2>
              <div className="grid gap-3">
                {entregasBacklog.map((entrega) => (
                  <Card key={entrega.id} className="border-border/30 bg-muted/20">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-muted-foreground">{entrega.titulo}</h3>
                          {entrega.descricao && (
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              {entrega.descricao}
                            </p>
                          )}
                          {entrega.justificativa_backlog && (
                            <p className="text-xs text-muted-foreground/60 mt-2 italic">
                              {entrega.justificativa_backlog}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs self-start">
                          {entrega.tipo === 'backlog' ? 'Backlog' : 'Futura'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
