import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  Circle,
  ListChecks,
  Filter,
  Loader2,
  ExternalLink,
  Trash2,
  Package,
  Lightbulb,
  Bot
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InstrucoesBusinessManagerProps {
  contratoId: string;
  userId?: string;
  userName?: string;
}

interface InstrucaoComRelacionamentos {
  id: string;
  titulo: string;
  descricao: string | null;
  responsavel: string;
  ferramenta: string | null;
  ordem: number;
  prompt_sugerido: string | null;
  dicas: string | null;
  recursos_url: string | null;
  status: string;
  entrega_id: string | null;
  etapa_id: string | null;
  etapas_business: {
    id: string;
    numero_etapa: number;
    titulo: string;
  } | null;
  entregas_business: {
    id: string;
    titulo: string;
    numero_entrega: number | null;
    etapa_id: string | null;
  } | null;
}

const statusConfig = {
  pendente: { label: "Pendente", icon: Circle, className: "text-muted-foreground" },
  em_andamento: { label: "Em Andamento", icon: Clock, className: "text-amber-500" },
  concluida: { label: "Concluída", icon: CheckCircle2, className: "text-emerald-500" },
};

const responsavelConfig = {
  voce: { label: "Cliente", className: "bg-blue-500/10 text-blue-600" },
  conjunto: { label: "Conjunto", className: "bg-amber-500/10 text-amber-600" },
};

function useInstrucoesByContrato(contratoId?: string) {
  return useQuery({
    queryKey: ['instrucoes-contrato', contratoId],
    queryFn: async () => {
      // Primeiro busca todas as etapas do contrato
      const { data: etapas } = await supabase
        .from('etapas_business')
        .select('id')
        .eq('contrato_id', contratoId);
      
      if (!etapas?.length) return [];
      
      const etapaIds = etapas.map(e => e.id);
      
      // Busca todas instruções dessas etapas com entregas relacionadas
      const { data, error } = await supabase
        .from('instrucoes_etapa')
        .select(`
          *,
          etapas_business (
            id,
            numero_etapa,
            titulo
          ),
          entregas_business (
            id,
            titulo,
            numero_entrega,
            etapa_id
          )
        `)
        .in('etapa_id', etapaIds)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as InstrucaoComRelacionamentos[];
    },
    enabled: !!contratoId,
  });
}

// Tipo para estrutura hierárquica
interface EntregaAgrupada {
  entrega: InstrucaoComRelacionamentos['entregas_business'];
  instrucoes: InstrucaoComRelacionamentos[];
}

interface FaseAgrupada {
  etapa: InstrucaoComRelacionamentos['etapas_business'];
  entregas: Record<string, EntregaAgrupada>;
  instrucoesAvulsas: InstrucaoComRelacionamentos[];
}

// Componente para instrução com expansão - Extraído para evitar violação de regras de Hooks
function InstrucaoItemAdmin({ instrucao }: { instrucao: InstrucaoComRelacionamentos }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[instrucao.status as keyof typeof statusConfig] || statusConfig.pendente;
  const responsavel = responsavelConfig[instrucao.responsavel as keyof typeof responsavelConfig] || responsavelConfig.voce;
  const StatusIcon = status.icon;
  
  const temDetalhes = instrucao.prompt_sugerido || instrucao.dicas;

  return (
    <div className="px-4 py-3 bg-muted/20 rounded-lg">
      <div className="flex items-start gap-3">
        <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", status.className)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{instrucao.titulo}</span>
            <Badge variant="outline" className={cn("text-xs", responsavel.className)}>
              {responsavel.label}
            </Badge>
            {instrucao.ferramenta && (
              <Badge variant="secondary" className="text-xs">
                {instrucao.ferramenta}
              </Badge>
            )}
          </div>
          {instrucao.descricao && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {instrucao.descricao}
            </p>
          )}

          {/* Botão de expansão para detalhes */}
          {temDetalhes && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
                  <ChevronDown className={cn(
                    "h-3 w-3 mr-1 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                  {isExpanded ? "Menos detalhes" : "Mais detalhes"}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                {instrucao.prompt_sugerido && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary uppercase">
                        Prompt Sugerido
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-foreground/80">
                      {instrucao.prompt_sugerido}
                    </p>
                  </div>
                )}
                
                {instrucao.dicas && (
                  <div className="flex items-start gap-2 text-sm bg-accent/10 border border-accent/30 rounded-lg p-3">
                    <Lightbulb className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-accent-foreground uppercase block mb-1">
                        Dicas
                      </span>
                      <span className="text-foreground/80">{instrucao.dicas}</span>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {instrucao.recursos_url && (
            <a 
              href={instrucao.recursos_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              Ver recurso
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function InstrucoesBusinessManager({ contratoId, userId, userName }: InstrucoesBusinessManagerProps) {
  const queryClient = useQueryClient();
  const { data: instrucoes, isLoading, refetch } = useInstrucoesByContrato(contratoId);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [responsavelFilter, setResponsavelFilter] = useState<string>("all");
  const [expandedFases, setExpandedFases] = useState<Set<number>>(new Set([1, 2, 3]));
  const [expandedEntregas, setExpandedEntregas] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const { data: etapas } = await supabase
        .from('etapas_business')
        .select('id')
        .eq('contrato_id', contratoId);
      
      if (etapas && etapas.length > 0) {
        const etapaIds = etapas.map(e => e.id);
        
        const { error } = await supabase
          .from("instrucoes_etapa")
          .delete()
          .in("etapa_id", etapaIds);
        
        if (error) throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ["instrucoes-contrato", contratoId] });
      toast.success("Todas as instruções foram removidas");
      refetch();
    } catch (error) {
      console.error("Erro ao limpar:", error);
      toast.error("Erro ao limpar instruções");
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Aplicar filtros primeiro
  const instrucoesFiltradas = (instrucoes || []).filter(i => {
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (responsavelFilter !== "all" && i.responsavel !== responsavelFilter) return false;
    return true;
  });

  // Agrupar instruções por FASE > ENTREGA
  const instrucoesPorFaseEEntrega = instrucoesFiltradas.reduce((acc, instrucao) => {
    const faseNum = instrucao.etapas_business?.numero_etapa || 0;
    const entregaId = instrucao.entrega_id || 'sem-entrega';
    
    if (!acc[faseNum]) {
      acc[faseNum] = {
        etapa: instrucao.etapas_business,
        entregas: {},
        instrucoesAvulsas: [],
      };
    }
    
    if (instrucao.entrega_id && instrucao.entregas_business) {
      if (!acc[faseNum].entregas[entregaId]) {
        acc[faseNum].entregas[entregaId] = {
          entrega: instrucao.entregas_business,
          instrucoes: [],
        };
      }
      acc[faseNum].entregas[entregaId].instrucoes.push(instrucao);
    } else {
      acc[faseNum].instrucoesAvulsas.push(instrucao);
    }
    
    return acc;
  }, {} as Record<number, FaseAgrupada>);

  const toggleFase = (faseNum: number) => {
    const newSet = new Set(expandedFases);
    if (newSet.has(faseNum)) {
      newSet.delete(faseNum);
    } else {
      newSet.add(faseNum);
    }
    setExpandedFases(newSet);
  };

  const toggleEntrega = (entregaId: string) => {
    const newSet = new Set(expandedEntregas);
    if (newSet.has(entregaId)) {
      newSet.delete(entregaId);
    } else {
      newSet.add(entregaId);
    }
    setExpandedEntregas(newSet);
  };

  // Estatísticas
  const totalInstrucoes = instrucoes?.length || 0;
  const concluidas = instrucoes?.filter(i => i.status === 'concluida').length || 0;
  const emAndamento = instrucoes?.filter(i => i.status === 'em_andamento').length || 0;

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Instruções do Projeto
          </h3>
          {userName && (
            <p className="text-sm text-muted-foreground">{userName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalInstrucoes > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar todas as instruções?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover permanentemente todas as instruções. 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} disabled={isClearing} className="bg-destructive text-destructive-foreground">
                    {isClearing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Sim, limpar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Badge variant="outline" className="text-xs">
            {concluidas}/{totalInstrucoes} concluídas
          </Badge>
          {emAndamento > 0 && (
            <Badge variant="secondary" className="text-xs">
              {emAndamento} em andamento
            </Badge>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-border/50">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="voce">Cliente</SelectItem>
                  <SelectItem value="conjunto">Conjunto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista hierárquica: FASE > ENTREGA > INSTRUÇÃO */}
      {Object.keys(instrucoesPorFaseEEntrega).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <ListChecks className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">Nenhuma instrução encontrada</p>
            <p className="text-sm text-muted-foreground">
              {totalInstrucoes === 0 
                ? "Gere as etapas do projeto primeiro para adicionar instruções"
                : "Nenhuma instrução corresponde aos filtros selecionados"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {Object.entries(instrucoesPorFaseEEntrega)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([faseNum, { etapa, entregas, instrucoesAvulsas }]) => {
              const isFaseExpanded = expandedFases.has(Number(faseNum));
              const totalEntregas = Object.keys(entregas).length;
              const totalInstrucoesFase = Object.values(entregas).reduce((sum, e) => sum + e.instrucoes.length, 0) + instrucoesAvulsas.length;
              const concluidasFase = Object.values(entregas).reduce((sum, e) => 
                sum + e.instrucoes.filter(i => i.status === 'concluida').length, 0
              ) + instrucoesAvulsas.filter(i => i.status === 'concluida').length;

              return (
                <Collapsible 
                  key={faseNum} 
                  open={isFaseExpanded} 
                  onOpenChange={() => toggleFase(Number(faseNum))}
                >
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <ChevronDown className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            !isFaseExpanded && "-rotate-90"
                          )} />
                          <div>
                            <h4 className="font-medium text-sm">
                              📁 Fase {faseNum}: {etapa?.titulo || "Sem título"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {totalEntregas} entrega(s) • {concluidasFase}/{totalInstrucoesFase} instruções concluídas
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {totalInstrucoesFase} instrução(ões)
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border/50 p-3 space-y-3">
                        {/* Entregas com suas instruções */}
                        {Object.entries(entregas)
                          .sort(([, a], [, b]) => 
                            (a.entrega?.numero_entrega || 0) - (b.entrega?.numero_entrega || 0)
                          )
                          .map(([entregaId, { entrega, instrucoes }]) => {
                            const isEntregaExpanded = expandedEntregas.has(entregaId);
                            const concluidasEntrega = instrucoes.filter(i => i.status === 'concluida').length;
                            const numeroEntrega = entrega?.numero_entrega;

                            return (
                              <Collapsible
                                key={entregaId}
                                open={isEntregaExpanded}
                                onOpenChange={() => toggleEntrega(entregaId)}
                              >
                                <div className="border border-border/40 rounded-lg bg-card/50">
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted/20 transition-colors rounded-t-lg">
                                      <div className="flex items-center gap-2">
                                        <ChevronDown className={cn(
                                          "h-3.5 w-3.5 text-muted-foreground transition-transform",
                                          !isEntregaExpanded && "-rotate-90"
                                        )} />
                                        <Package className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-sm">
                                          {numeroEntrega ? `${numeroEntrega}. ` : ""}{entrega?.titulo || "Entrega sem título"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          {concluidasEntrega}/{instrucoes.length}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                          {instrucoes.length} instrução(ões)
                                        </Badge>
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="p-2 pt-0 space-y-2">
                                      {instrucoes.map(instrucao => (
                                        <InstrucaoItemAdmin key={instrucao.id} instrucao={instrucao} />
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            );
                          })}

                        {/* Instruções avulsas (sem entrega vinculada) */}
                        {instrucoesAvulsas.length > 0 && (
                          <div className="border border-dashed border-border/40 rounded-lg p-3">
                            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Circle className="h-3 w-3" />
                              Instruções sem entrega vinculada
                            </h5>
                            <div className="space-y-2">
                              {instrucoesAvulsas.map(instrucao => (
                                <InstrucaoItemAdmin key={instrucao.id} instrucao={instrucao} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
        </div>
      )}
    </div>
  );
}
