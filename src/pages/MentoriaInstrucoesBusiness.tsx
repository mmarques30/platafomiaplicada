import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2, Package, FolderOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness, useInstrucoesByContrato, useUpdateInstrucao } from "@/hooks/useEtapasBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { InstrucaoCard } from "@/components/mentoria/business/InstrucaoCard";
import { cn } from "@/lib/utils";

interface FaseAgrupada {
  etapa: {
    id: string;
    numero_etapa: number;
    titulo: string;
  };
  entregas: {
    entrega: {
      id: string;
      titulo: string;
      numero_entrega: number | null;
    };
    instrucoes: typeof instrucoesData;
    progresso: number;
  }[];
  instrucoesAvulsas: typeof instrucoesData;
  progressoFase: number;
}

type InstrucaoData = ReturnType<typeof useInstrucoesByContrato>['data'];
const instrucoesData: NonNullable<InstrucaoData> = [];

export default function MentoriaInstrucoesBusiness() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: loadingContrato } = useContratosBusiness(businessUserId);
  const { data: etapas, isLoading: loadingEtapas } = useEtapasBusiness(contrato?.id);
  const { entregas } = useEntregasBusiness(contrato?.id);
  const { data: instrucoes, isLoading: loadingInstrucoes } = useInstrucoesByContrato(contrato?.id);
  const updateInstrucao = useUpdateInstrucao();

  const [expandedFases, setExpandedFases] = useState<Set<string>>(new Set());

  const isLoading = loadingContrato || loadingEtapas || loadingInstrucoes;

  // Agrupar por Fase > Entrega
  const fasesAgrupadas = useMemo(() => {
    if (!etapas || !instrucoes) return [];

    return etapas.map((etapa): FaseAgrupada => {
      const instrucoesEtapa = instrucoes.filter(i => i.etapa_id === etapa.id);
      const entregasEtapa = entregas.filter(e => e.etapa_id === etapa.id);

      // Agrupar instruções por entrega
      const entregasComInstrucoes = entregasEtapa.map(entrega => {
        const instrucoesEntrega = instrucoesEtapa.filter(i => 
          (i as any).entrega_id === entrega.id
        );
        const concluidas = instrucoesEntrega.filter(i => i.status === 'concluida').length;
        const progresso = instrucoesEntrega.length > 0 
          ? Math.round((concluidas / instrucoesEntrega.length) * 100) 
          : 0;

        return {
          entrega: {
            id: entrega.id,
            titulo: entrega.titulo,
            numero_entrega: entrega.numero_entrega,
          },
          instrucoes: instrucoesEntrega,
          progresso,
        };
      }).filter(e => e.instrucoes.length > 0);

      // Instruções sem entrega vinculada
      const entregaIds = new Set(entregasEtapa.map(e => e.id));
      const instrucoesAvulsas = instrucoesEtapa.filter(i => 
        !(i as any).entrega_id || !entregaIds.has((i as any).entrega_id)
      );

      // Progresso da fase
      const totalInstrucoes = instrucoesEtapa.length;
      const concluidasFase = instrucoesEtapa.filter(i => i.status === 'concluida').length;
      const progressoFase = totalInstrucoes > 0 
        ? Math.round((concluidasFase / totalInstrucoes) * 100) 
        : 0;

      return {
        etapa: {
          id: etapa.id,
          numero_etapa: etapa.numero_etapa,
          titulo: etapa.titulo,
        },
        entregas: entregasComInstrucoes,
        instrucoesAvulsas,
        progressoFase,
      };
    }).filter(f => f.entregas.length > 0 || f.instrucoesAvulsas.length > 0);
  }, [etapas, entregas, instrucoes]);

  // Progresso geral
  const totalInstrucoes = instrucoes?.length || 0;
  const instrucoesConcluidas = instrucoes?.filter(i => i.status === 'concluida').length || 0;
  const progressoGeral = totalInstrucoes > 0 
    ? Math.round((instrucoesConcluidas / totalInstrucoes) * 100) 
    : 0;

  const toggleFase = (faseId: string) => {
    setExpandedFases(prev => {
      const next = new Set(prev);
      if (next.has(faseId)) {
        next.delete(faseId);
      } else {
        next.add(faseId);
      }
      return next;
    });
  };

  const handleToggleStatus = (id: string, novoStatus: 'pendente' | 'concluida') => {
    // Find the instrucao to get its etapaId
    const instrucao = instrucoes?.find(i => i.id === id);
    if (!instrucao) return;
    updateInstrucao.mutate({ id, etapaId: instrucao.etapa_id, status: novoStatus });
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/mentoria")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Minhas Instruções</h1>
          <p className="text-muted-foreground text-sm">
            Instruções organizadas por fase e entrega
          </p>
        </div>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <span>Progresso Geral</span>
            <span className="text-sm font-normal text-muted-foreground">
              {instrucoesConcluidas}/{totalInstrucoes} instruções concluídas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressoGeral} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {progressoGeral}% concluído
          </p>
        </CardContent>
      </Card>

      {/* Lista de Fases */}
      <div className="space-y-4">
        {fasesAgrupadas.map((fase) => (
          <Collapsible
            key={fase.etapa.id}
            open={expandedFases.has(fase.etapa.id)}
            onOpenChange={() => toggleFase(fase.etapa.id)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                        fase.progressoFase === 100 
                          ? "bg-emerald-500/20 text-emerald-600" 
                          : "bg-primary/20 text-primary"
                      )}>
                        {fase.progressoFase === 100 ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          fase.etapa.numero_etapa
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Fase {fase.etapa.numero_etapa}: {fase.etapa.titulo}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {fase.entregas.length} entregas • {fase.progressoFase}% concluído
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress value={fase.progressoFase} className="h-2" />
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        expandedFases.has(fase.etapa.id) && "rotate-180"
                      )} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-6">
                  {/* Entregas com suas instruções */}
                  {fase.entregas.map((entregaGroup) => (
                    <div key={entregaGroup.entrega.id} className="space-y-3">
                      <div 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => navigate(`/mentoria/entrega/${entregaGroup.entrega.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {entregaGroup.entrega.numero_entrega 
                              ? `Entrega ${entregaGroup.entrega.numero_entrega}: ` 
                              : ''
                            }
                            {entregaGroup.entrega.titulo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {entregaGroup.progresso}%
                          </span>
                          <div className="w-16">
                            <Progress value={entregaGroup.progresso} className="h-1.5" />
                          </div>
                        </div>
                      </div>

                      <div className="pl-4 space-y-2">
                        {entregaGroup.instrucoes.map((instrucao) => (
                          <InstrucaoCard
                            key={instrucao.id}
                            instrucao={instrucao}
                            onToggleStatus={handleToggleStatus}
                            isUpdating={updateInstrucao.isPending}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Instruções avulsas (sem entrega) */}
                  {fase.instrucoesAvulsas.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm text-muted-foreground">
                          Outras Instruções
                        </span>
                      </div>
                      <div className="pl-4 space-y-2">
                        {fase.instrucoesAvulsas.map((instrucao) => (
                          <InstrucaoCard
                            key={instrucao.id}
                            instrucao={instrucao}
                            onToggleStatus={handleToggleStatus}
                            isUpdating={updateInstrucao.isPending}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {fasesAgrupadas.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhuma instrução cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
