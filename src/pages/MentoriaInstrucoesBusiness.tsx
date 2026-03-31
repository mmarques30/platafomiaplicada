import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Package, FolderOpen, CheckCircle2, Filter } from "lucide-react";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness, useInstrucoesByContrato, useUpdateInstrucao } from "@/hooks/useEtapasBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { InstrucaoCard } from "@/components/mentoria/business/InstrucaoCard";
import { PageTitle } from "@/components/shared/PageTitle";
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
  const [filtroFase, setFiltroFase] = useState<string>("todas");
  const [filtroEntrega, setFiltroEntrega] = useState<string>("todas");

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

  // Lista de entregas para o filtro
  const entregasDisponiveis = useMemo(() => {
    const todasEntregas: { id: string; titulo: string; faseId: string }[] = [];
    fasesAgrupadas.forEach(fase => {
      fase.entregas.forEach(e => {
        todasEntregas.push({
          id: e.entrega.id,
          titulo: e.entrega.numero_entrega 
            ? `Entrega ${e.entrega.numero_entrega}: ${e.entrega.titulo}`
            : e.entrega.titulo,
          faseId: fase.etapa.id
        });
      });
    });
    return todasEntregas;
  }, [fasesAgrupadas]);

  // Filtrar fases e entregas
  const fasesFiltradas = useMemo(() => {
    let resultado = fasesAgrupadas;
    
    // Filtrar por fase
    if (filtroFase !== "todas") {
      resultado = resultado.filter(f => f.etapa.id === filtroFase);
    }
    
    // Filtrar por entrega
    if (filtroEntrega !== "todas") {
      resultado = resultado.map(fase => ({
        ...fase,
        entregas: fase.entregas.filter(e => e.entrega.id === filtroEntrega),
        instrucoesAvulsas: [] // Esconder avulsas quando filtrar por entrega específica
      })).filter(f => f.entregas.length > 0);
    }
    
    return resultado;
  }, [fasesAgrupadas, filtroFase, filtroEntrega]);

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
    return <PageSkeleton variant="evolucao" />;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/mentoria")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="mb-8">
        <PageTitle primary="Minhas" secondary="Instruções" />
        <p className="text-muted-foreground text-lg mt-2">
          Instruções organizadas por fase e entrega
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Fase:</span>
                <Select value={filtroFase} onValueChange={setFiltroFase}>
                  <SelectTrigger className="w-[200px] bg-background">
                    <SelectValue placeholder="Todas as fases" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="todas">Todas as fases</SelectItem>
                    {fasesAgrupadas.map(fase => (
                      <SelectItem key={fase.etapa.id} value={fase.etapa.id}>
                        Fase {fase.etapa.numero_etapa}: {fase.etapa.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Entrega:</span>
                <Select value={filtroEntrega} onValueChange={setFiltroEntrega}>
                  <SelectTrigger className="w-[280px] bg-background">
                    <SelectValue placeholder="Todas as entregas" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="todas">Todas as entregas</SelectItem>
                    {entregasDisponiveis
                      .filter(e => filtroFase === "todas" || e.faseId === filtroFase)
                      .map(entrega => (
                        <SelectItem key={entrega.id} value={entrega.id}>
                          {entrega.titulo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(filtroFase !== "todas" || filtroEntrega !== "todas") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setFiltroFase("todas");
                  setFiltroEntrega("todas");
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
        {fasesFiltradas.map((fase) => (
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

      {fasesFiltradas.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {filtroFase !== "todas" || filtroEntrega !== "todas" 
                ? "Nenhuma instrução encontrada com os filtros selecionados."
                : "Nenhuma instrução cadastrada ainda."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
