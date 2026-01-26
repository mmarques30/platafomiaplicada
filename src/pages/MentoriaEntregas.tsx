import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", icon: Clock, variant: "secondary" as const },
  em_andamento: { label: "Em Andamento", icon: AlertCircle, variant: "default" as const },
  concluida: { label: "Concluída", icon: CheckCircle2, variant: "outline" as const },
  cancelada: { label: "Cancelada", icon: AlertCircle, variant: "destructive" as const },
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
  const { entregas, entregasAtivas, entregasBacklog, isLoading: isLoadingEntregas } = useEntregasBusiness(contrato?.id);
  const { data: etapas } = useEtapasBusiness(contrato?.id);

  const isLoading = isLoadingContrato || isLoadingEntregas;

  const getEtapaNome = (etapaId?: string) => {
    if (!etapaId || !etapas) return null;
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa ? `Etapa ${etapa.numero_etapa}: ${etapa.titulo}` : null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-48" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
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
    <div className="container mx-auto py-8 px-4 max-w-5xl">
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
              <div className="space-y-3">
                {entregasAtivas.map((entrega) => {
                  const statusConfig = STATUS_CONFIG[entrega.status];
                  const prioridadeConfig = PRIORIDADE_CONFIG[entrega.prioridade];
                  const StatusIcon = statusConfig.icon;
                  const etapaNome = getEtapaNome(entrega.etapa_id);

                  return (
                    <Card key={entrega.id} className="border-border/50">
                      <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{entrega.titulo}</h3>
                              <Badge variant={prioridadeConfig.variant} className="text-xs">
                                {prioridadeConfig.label}
                              </Badge>
                            </div>
                            {entrega.descricao && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {entrega.descricao}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {etapaNome && (
                                <span className="bg-muted/50 px-2 py-0.5 rounded">
                                  {etapaNome}
                                </span>
                              )}
                              {entrega.modulo_relacionado && (
                                <span className="bg-muted/50 px-2 py-0.5 rounded">
                                  {entrega.modulo_relacionado}
                                </span>
                              )}
                              {entrega.prazo_previsto && (
                                <span>
                                  Prazo: {format(parseISO(entrega.prazo_previsto), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={statusConfig.variant} className="flex items-center gap-1 self-start">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
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
              <div className="space-y-2">
                {entregasBacklog.map((entrega) => (
                  <Card key={entrega.id} className="border-border/30 bg-muted/20">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-muted-foreground">{entrega.titulo}</h3>
                          {entrega.justificativa_backlog && (
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {entrega.justificativa_backlog}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
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
