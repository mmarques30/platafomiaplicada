import { useParams, useNavigate } from "react-router-dom";
import { useEntregaById } from "@/hooks/useEntregasBusiness";
import { useInstrucoesByEntrega, useUpdateInstrucao } from "@/hooks/useEtapasBusiness";
import { InstrucaoCard } from "@/components/mentoria/business/InstrucaoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Users, Package, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  pendente: { label: "Pendente", className: "bg-muted text-muted-foreground" },
  em_andamento: { label: "Em Andamento", className: "bg-accent/50 text-accent-foreground border-accent" },
  concluida: { label: "Concluída", className: "bg-primary/10 text-primary border-primary/30" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const prioridadeConfig = {
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  media: { label: "Média", className: "bg-secondary text-secondary-foreground" },
  alta: { label: "Alta", className: "bg-accent/50 text-accent-foreground" },
  critica: { label: "Crítica", className: "bg-destructive/10 text-destructive" },
};

export default function MentoriaEntregaDetalhe() {
  const { entregaId } = useParams<{ entregaId: string }>();
  const navigate = useNavigate();
  const { data: entrega, isLoading: loadingEntrega } = useEntregaById(entregaId);
  const { data: instrucoes, isLoading: loadingInstrucoes } = useInstrucoesByEntrega(entregaId);
  const updateInstrucao = useUpdateInstrucao();

  const handleToggleStatus = (id: string, novoStatus: 'pendente' | 'concluida') => {
    if (!entregaId) return;
    updateInstrucao.mutate({ id, etapaId: entrega?.etapa_id || '', status: novoStatus });
  };

  if (loadingEntrega || loadingInstrucoes) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!entrega) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Entrega não encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const instrucoesVoce = instrucoes?.filter(i => i.responsavel === 'voce') || [];
  const instrucoesConjunto = instrucoes?.filter(i => i.responsavel === 'conjunto' || i.responsavel === 'mentor') || [];

  const calcularProgresso = (lista: typeof instrucoes) => {
    if (!lista || lista.length === 0) return 0;
    const concluidas = lista.filter(i => i.status === 'concluida').length;
    return Math.round((concluidas / lista.length) * 100);
  };

  const statusInfo = statusConfig[entrega.status] || statusConfig.pendente;
  const prioridadeInfo = prioridadeConfig[entrega.prioridade] || prioridadeConfig.media;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
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
              <h1 className="text-xl font-semibold">{entrega.titulo}</h1>
              {entrega.modulo_relacionado && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Módulo: {entrega.modulo_relacionado}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn(statusInfo.className)}>
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className={cn(prioridadeInfo.className)}>
              Prioridade {prioridadeInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Descrição */}
      {entrega.descricao && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">{entrega.descricao}</p>
          </CardContent>
        </Card>
      )}

      {/* Instruções - Sua Responsabilidade */}
      {instrucoesVoce.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Suas Instruções
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {calcularProgresso(instrucoesVoce)}% concluído
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instrucoesVoce.map(instrucao => (
              <InstrucaoCard
                key={instrucao.id}
                instrucao={instrucao}
                onToggleStatus={handleToggleStatus}
                isUpdating={updateInstrucao.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instruções - Conjunto/Reunião */}
      {instrucoesConjunto.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent-foreground" />
                Na Próxima Reunião
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {calcularProgresso(instrucoesConjunto)}% concluído
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instrucoesConjunto.map(instrucao => (
              <InstrucaoCard
                key={instrucao.id}
                instrucao={instrucao}
                onToggleStatus={handleToggleStatus}
                isUpdating={updateInstrucao.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {(!instrucoes || instrucoes.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma instrução cadastrada para esta entrega.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
