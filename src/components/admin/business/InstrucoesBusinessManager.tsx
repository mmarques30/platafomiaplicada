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
  Trash2
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

interface InstrucaoComEtapa {
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
  etapas_business: {
    id: string;
    numero_etapa: number;
    titulo: string;
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
      
      // Depois busca todas instruções dessas etapas
      const { data, error } = await supabase
        .from('instrucoes_etapa')
        .select(`
          *,
          etapas_business (
            id,
            numero_etapa,
            titulo
          )
        `)
        .in('etapa_id', etapaIds)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as InstrucaoComEtapa[];
    },
    enabled: !!contratoId,
  });
}

export function InstrucoesBusinessManager({ contratoId, userId, userName }: InstrucoesBusinessManagerProps) {
  const queryClient = useQueryClient();
  const { data: instrucoes, isLoading, refetch } = useInstrucoesByContrato(contratoId);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [responsavelFilter, setResponsavelFilter] = useState<string>("all");
  const [expandedEtapas, setExpandedEtapas] = useState<Set<number>>(new Set([1, 2, 3]));
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      // Primeiro busca todas as etapas do contrato
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

  // Agrupar instruções por etapa
  const instrucoesPorEtapa = (instrucoes || []).reduce((acc, instrucao) => {
    const etapaNum = instrucao.etapas_business?.numero_etapa || 0;
    if (!acc[etapaNum]) {
      acc[etapaNum] = {
        etapa: instrucao.etapas_business,
        instrucoes: [],
      };
    }
    acc[etapaNum].instrucoes.push(instrucao);
    return acc;
  }, {} as Record<number, { etapa: InstrucaoComEtapa['etapas_business']; instrucoes: InstrucaoComEtapa[] }>);

  // Aplicar filtros
  const filteredInstrucoesPorEtapa = Object.entries(instrucoesPorEtapa).reduce((acc, [etapaNum, { etapa, instrucoes }]) => {
    const filtered = instrucoes.filter(i => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (responsavelFilter !== "all" && i.responsavel !== responsavelFilter) return false;
      return true;
    });
    if (filtered.length > 0) {
      acc[Number(etapaNum)] = { etapa, instrucoes: filtered };
    }
    return acc;
  }, {} as typeof instrucoesPorEtapa);

  const toggleEtapa = (etapaNum: number) => {
    const newSet = new Set(expandedEtapas);
    if (newSet.has(etapaNum)) {
      newSet.delete(etapaNum);
    } else {
      newSet.add(etapaNum);
    }
    setExpandedEtapas(newSet);
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

      {/* Lista agrupada por etapa */}
      {Object.keys(filteredInstrucoesPorEtapa).length === 0 ? (
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
          {Object.entries(filteredInstrucoesPorEtapa)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([etapaNum, { etapa, instrucoes }]) => {
              const isExpanded = expandedEtapas.has(Number(etapaNum));
              const concluidas = instrucoes.filter(i => i.status === 'concluida').length;

              return (
                <Collapsible 
                  key={etapaNum} 
                  open={isExpanded} 
                  onOpenChange={() => toggleEtapa(Number(etapaNum))}
                >
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <ChevronDown className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            !isExpanded && "-rotate-90"
                          )} />
                          <div>
                            <h4 className="font-medium text-sm">
                              Encontro {etapaNum} - {etapa?.titulo || "Sem título"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {concluidas}/{instrucoes.length} instruções concluídas
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {instrucoes.length} instrução(ões)
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border/50 divide-y divide-border/30">
                        {instrucoes.map((instrucao) => {
                          const status = statusConfig[instrucao.status as keyof typeof statusConfig] || statusConfig.pendente;
                          const responsavel = responsavelConfig[instrucao.responsavel as keyof typeof responsavelConfig] || responsavelConfig.voce;
                          const StatusIcon = status.icon;

                          return (
                            <div key={instrucao.id} className="px-4 py-3 flex items-start gap-3">
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
                                {instrucao.recursos_url && (
                                  <a 
                                    href={instrucao.recursos_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Ver recurso
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
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