import { useParams, useNavigate } from "react-router-dom";
import { useEntregaById, EntregaBusiness } from "@/hooks/useEntregasBusiness";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, AlertCircle, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { normalizeEntregaPrioridade, normalizeEntregaStatus } from "@/lib/business-entregas-normalizers";
import { PageContainer } from "@/components/shared/PageContainer";

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

export default function MentoriaEntregaDetalhe() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: entrega, isLoading: loadingEntrega } = useEntregaById(entregaId);

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
      queryClient.invalidateQueries({ queryKey: ["entrega-business", entregaId] });
      toast.success("Entrega atualizada");
    },
    onError: () => {
      toast.error("Erro ao atualizar entrega");
    },
  });

  const handleStatusChange = (newStatus: EntregaBusiness['status']) => {
    if (!entregaId) return;
    updateEntrega.mutate({ id: entregaId, status: newStatus });
  };

  if (loadingEntrega) {
    return (
      <PageContainer size="narrow">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </PageContainer>
    );
  }

  if (!entrega) {
    return (
      <PageContainer size="narrow">
        <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2 w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Entrega não encontrada</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const statusNormalizado = normalizeEntregaStatus(entrega.status);
  const prioridadeNormalizada = normalizeEntregaPrioridade(entrega.prioridade);
  const statusConfig = STATUS_CONFIG[statusNormalizado] ?? STATUS_CONFIG.pendente;
  const prioridadeConfig = PRIORIDADE_CONFIG[prioridadeNormalizada] ?? PRIORIDADE_CONFIG.media;
  const StatusIcon = statusConfig.icon;

  return (
    <PageContainer size="narrow">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Entregas
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {entrega.numero_entrega ? `Entrega ${entrega.numero_entrega}: ` : ''}
                {entrega.titulo}
              </h1>
              {entrega.modulo_relacionado && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Módulo: {entrega.modulo_relacionado}
                </p>
              )}
            </div>
          </div>

          <Badge variant={prioridadeConfig.variant} className="text-xs">
            Prioridade {prioridadeConfig.label}
          </Badge>
        </div>
      </div>

      {/* Status Card */}
      <Card className={cn(
        "border-l-4",
        entrega.status === 'concluida' && "border-l-green-500 bg-green-50/30 dark:bg-green-950/10",
        entrega.status === 'em_andamento' && "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10",
        entrega.status === 'pendente' && "border-l-muted-foreground/30",
        entrega.status === 'cancelada' && "border-l-destructive opacity-60"
      )}>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
              <span className="font-medium">Status Atual:</span>
            </div>
            
            <div className="w-full sm:w-48">
              <Select
                value={statusNormalizado}
                onValueChange={handleStatusChange}
                disabled={updateEntrega.isPending}
              >
                <SelectTrigger className={cn(
                  "w-full",
                  statusNormalizado === 'concluida' && "border-green-500 text-green-600",
                  statusNormalizado === 'em_andamento' && "border-amber-500 text-amber-600"
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

      {/* Descrição */}
      {entrega.descricao && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-sm font-medium mb-2">Descrição</p>
            <p className="text-sm text-muted-foreground">{entrega.descricao}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações Adicionais */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entrega.modulo_relacionado && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Módulo</p>
                <p className="text-sm font-medium">{entrega.modulo_relacionado}</p>
              </div>
            )}
            {entrega.prazo_previsto && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Prazo Previsto</p>
                <p className="text-sm font-medium">
                  {format(parseISO(entrega.prazo_previsto), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
            {entrega.tipo && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                <Badge variant="outline" className="text-xs capitalize">
                  {entrega.tipo}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dica para Instruções */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Instruções detalhadas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Para ver as instruções passo a passo desta entrega, acesse o menu <strong>"Instruções"</strong> no painel lateral.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
