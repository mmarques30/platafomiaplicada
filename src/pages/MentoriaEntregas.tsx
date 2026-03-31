import { useNavigate } from "react-router-dom";
import { StaggerList } from "@/components/ui/StaggerList";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ArrowLeft, Package, Clock, CheckCircle2, AlertCircle, PlayCircle, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEntregasBusiness, EntregaBusiness } from "@/hooks/useEntregasBusiness";
import { useEtapasBusiness, EtapaBusiness } from "@/hooks/useEtapasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PageTitle } from "@/components/shared/PageTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
  const { entregas, entregasPorEtapa, calcularProgressoEtapa, isLoading: isLoadingEntregas, updateEntrega } = useEntregasBusiness(contrato?.id);
  const { data: etapas = [] } = useEtapasBusiness(contrato?.id);
  
  // Inicializar com primeira etapa aberta
  const [openEtapas, setOpenEtapas] = useState<string[]>(() => {
    const firstEtapaWithEntregas = etapas.find(e => entregasPorEtapa[e.id]?.length > 0);
    return firstEtapaWithEntregas ? [firstEtapaWithEntregas.id] : [];
  });

  const isLoading = isLoadingContrato || isLoadingEntregas;

  const toggleEtapa = (etapaId: string) => {
    setOpenEtapas(prev => 
      prev.includes(etapaId) 
        ? prev.filter(id => id !== etapaId)
        : [...prev, etapaId]
    );
  };

  const handleStatusChange = (entregaId: string, newStatus: EntregaBusiness['status']) => {
    updateEntrega.mutate({ id: entregaId, status: newStatus });
  };

  // Ordenar etapas por numero_etapa
  const etapasOrdenadas = [...etapas].sort((a, b) => a.numero_etapa - b.numero_etapa);

  // Entregas sem etapa
  const entregasSemEtapa = entregasPorEtapa['sem_etapa'] || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-3">
        <SkeletonCard variant="list" count={4} />
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

  const renderEntregaCard = (entrega: EntregaBusiness) => {
    const statusConfig = STATUS_CONFIG[entrega.status];
    const prioridadeConfig = PRIORIDADE_CONFIG[entrega.prioridade];
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
                  {entrega.titulo}
                </h3>
                <StatusBadge 
                  status={entrega.status === 'cancelada' ? 'cancelado' : entrega.status === 'concluida' ? 'concluido' : entrega.status} 
                  label={statusConfig.label} 
                />
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

  const renderEtapaSection = (etapa: EtapaBusiness) => {
    const entregasEtapa = entregasPorEtapa[etapa.id] || [];
    if (entregasEtapa.length === 0) return null;

    const isOpen = openEtapas.includes(etapa.id);
    const progresso = calcularProgressoEtapa(etapa.id);
    const concluidas = entregasEtapa.filter(e => e.status === 'concluida').length;

    return (
      <Collapsible 
        key={etapa.id} 
        open={isOpen}
        onOpenChange={() => toggleEtapa(etapa.id)}
      >
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-foreground">
                    Fase {etapa.numero_etapa}: {etapa.titulo}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {concluidas}/{entregasEtapa.length} entregas concluídas
                    </span>
                    {etapa.data_prevista && (
                      <span className="text-xs text-muted-foreground">
                        Prazo: {format(parseISO(etapa.data_prevista), "dd/MM", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  <Progress value={progresso} className="h-2 mt-2 max-w-md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    progresso === 100 && "bg-green-500/10 text-green-700 border-green-500/30",
                    progresso > 0 && progresso < 100 && "bg-amber-500/10 text-amber-700 border-amber-500/30",
                    progresso === 0 && "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {progresso}%
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="border-t border-border p-4 space-y-3">
              {entregasEtapa.map(renderEntregaCard)}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/mentoria")}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="mb-8">
        <PageTitle primary="Minhas" secondary="Entregas" />
        <p className="text-muted-foreground text-lg mt-2">
          {entregas.length} entrega{entregas.length !== 1 ? 's' : ''} no total
        </p>
      </div>

      {entregas.length === 0 ? (
        <EmptyState icon={Package} title="Nenhuma entrega ainda" description="As entregas definidas pela sua mentora aparecerão aqui." />
      ) : (
        <StaggerList className="space-y-4">
          {/* Entregas agrupadas por Fase */}
          {etapasOrdenadas.map(renderEtapaSection)}

          {/* Entregas sem fase associada */}
          {entregasSemEtapa.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <Package className="h-5 w-5" />
                Outras Entregas ({entregasSemEtapa.length})
              </h2>
              <div className="grid gap-3">
                {entregasSemEtapa.map(renderEntregaCard)}
              </div>
            </div>
          )}
        </StaggerList>
      )}
    </div>
  );
}