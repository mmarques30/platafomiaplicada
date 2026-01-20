import { useParams } from "react-router-dom";
import { useEtapaById, useInstrucoesEtapa, useUpdateInstrucao } from "@/hooks/useEtapasBusiness";
import { EtapaHeader } from "@/components/mentoria/business/EtapaHeader";
import { InstrucaoCard } from "@/components/mentoria/business/InstrucaoCard";
import { MarcosEtapa } from "@/components/mentoria/business/MarcosEtapa";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Target } from "lucide-react";

export default function MentoriaEtapa() {
  const { etapaId } = useParams<{ etapaId: string }>();
  const { data: etapa, isLoading: loadingEtapa } = useEtapaById(etapaId);
  const { data: instrucoes, isLoading: loadingInstrucoes } = useInstrucoesEtapa(etapaId);
  const updateInstrucao = useUpdateInstrucao();

  const handleToggleStatus = (id: string, novoStatus: 'pendente' | 'concluida') => {
    if (!etapaId) return;
    updateInstrucao.mutate({ id, etapaId, status: novoStatus });
  };

  if (loadingEtapa || loadingInstrucoes) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!etapa) {
    return (
      <div className="container max-w-4xl py-8">
        <p className="text-muted-foreground">Etapa não encontrada</p>
      </div>
    );
  }

  const instrucoesVoce = instrucoes?.filter(i => i.responsavel === 'voce') || [];
  const instrucoesConjunto = instrucoes?.filter(i => i.responsavel === 'conjunto') || [];

  const calcularProgresso = (lista: typeof instrucoes) => {
    if (!lista || lista.length === 0) return 0;
    const concluidas = lista.filter(i => i.status === 'concluida').length;
    return Math.round((concluidas / lista.length) * 100);
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <EtapaHeader etapa={etapa} />

      {/* Objetivo da Etapa */}
      {etapa.objetivo && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Objetivo desta Etapa</p>
                <p className="text-sm text-muted-foreground mt-1">{etapa.objetivo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {instrucoesVoce.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Instruções
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

      {instrucoesConjunto.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
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

      <MarcosEtapa marcos={etapa.marcos_proxima_etapa} />

      {(!instrucoes || instrucoes.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma instrução cadastrada para esta etapa.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
