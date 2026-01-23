import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Package, 
  ListTodo,
  ChevronDown,
  ChevronRight,
  Layers,
  Route,
  FileText,
  CheckSquare,
  Loader2
} from "lucide-react";
import { ResultadoProcessamento } from "@/hooks/useProcessarDocumentos";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeracaoEntregasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultado: ResultadoProcessamento | null;
  contratoId: string;
  onSuccess?: () => void;
}

interface EtapaSelecionada {
  numero: number;
  titulo: string;
  objetivo?: string;
  selecionada: boolean;
}

interface EntregaSelecionada {
  etapa_numero: number;
  numero_entrega: number;
  titulo: string;
  descricao: string;
  tipo: 'ativa' | 'backlog';
  prioridade: string;
  modulo_relacionado?: string;
  selecionada: boolean;
}

interface InstrucaoSelecionada {
  entrega_numero: number;
  titulo: string;
  descricao?: string;
  responsavel: string;
  ferramenta?: string;
  dicas?: string;
  ordem: number;
  selecionada: boolean;
}

interface TaskSelecionada {
  entrega_numero: number;
  titulo: string;
  tipo: string;
  prioridade: string;
  instrucoes_validacao?: string;
  selecionada: boolean;
}

interface BacklogSelecionado {
  titulo: string;
  descricao: string;
  justificativa: string;
  selecionado: boolean;
}

export function GeracaoEntregasModal({
  open,
  onOpenChange,
  resultado,
  contratoId,
  onSuccess,
}: GeracaoEntregasModalProps) {
  const queryClient = useQueryClient();
  
  const [etapas, setEtapas] = useState<EtapaSelecionada[]>([]);
  const [entregas, setEntregas] = useState<EntregaSelecionada[]>([]);
  const [instrucoes, setInstrucoes] = useState<InstrucaoSelecionada[]>([]);
  const [tasks, setTasks] = useState<TaskSelecionada[]>([]);
  const [backlog, setBacklog] = useState<BacklogSelecionado[]>([]);
  const [expandedEtapas, setExpandedEtapas] = useState<number[]>([]);
  const [expandedEntregas, setExpandedEntregas] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Detectar se é formato novo ou antigo
  const isNewFormat = resultado && resultado.etapas && resultado.etapas.length > 0;

  useEffect(() => {
    if (!resultado) return;

    if (isNewFormat) {
      // Formato novo com estrutura hierárquica
      setEtapas(resultado.etapas.map(e => ({ ...e, selecionada: true })));
      setEntregas(resultado.entregas.map(e => ({ ...e, selecionada: true })));
      setInstrucoes(resultado.instrucoes.map(i => ({ ...i, selecionada: true })));
      setTasks(resultado.tasks.map(t => ({ ...t, selecionada: true })));
      setBacklog(resultado.backlog.map(b => ({ ...b, selecionado: false })));
      
      // Expandir primeira etapa
      if (resultado.etapas.length > 0) {
        setExpandedEtapas([resultado.etapas[0].numero]);
      }
    } else {
      // Formato antigo - converter para novo
      const entregasAntigas = resultado.entregas_sugeridas || [];
      setEntregas(entregasAntigas.map((e, idx) => ({
        etapa_numero: 1,
        numero_entrega: idx + 1,
        titulo: e.titulo,
        descricao: e.descricao,
        tipo: e.tipo,
        prioridade: e.prioridade,
        modulo_relacionado: e.modulo_relacionado,
        selecionada: e.tipo === 'ativa',
      })));
      
      setBacklog((resultado.backlog_sugerido || []).map(b => ({
        ...b,
        selecionado: false,
      })));
    }
  }, [resultado, isNewFormat]);

  const toggleEtapa = (numero: number) => {
    setExpandedEtapas(prev =>
      prev.includes(numero)
        ? prev.filter(n => n !== numero)
        : [...prev, numero]
    );
  };

  const toggleEntrega = (numero: number) => {
    setExpandedEntregas(prev =>
      prev.includes(numero)
        ? prev.filter(n => n !== numero)
        : [...prev, numero]
    );
  };

  const toggleEtapaSelecionada = (numero: number) => {
    setEtapas(prev => prev.map(e => 
      e.numero === numero ? { ...e, selecionada: !e.selecionada } : e
    ));
  };

  const toggleEntregaSelecionada = (numero: number) => {
    setEntregas(prev => prev.map(e => 
      e.numero_entrega === numero ? { ...e, selecionada: !e.selecionada } : e
    ));
  };

  const toggleInstrucaoSelecionada = (entregaNumero: number, ordem: number) => {
    setInstrucoes(prev => prev.map(i => 
      i.entrega_numero === entregaNumero && i.ordem === ordem 
        ? { ...i, selecionada: !i.selecionada } 
        : i
    ));
  };

  const toggleTaskSelecionada = (entregaNumero: number, titulo: string) => {
    setTasks(prev => prev.map(t => 
      t.entrega_numero === entregaNumero && t.titulo === titulo 
        ? { ...t, selecionada: !t.selecionada } 
        : t
    ));
  };

  const toggleBacklog = (index: number) => {
    setBacklog(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selecionado: !updated[index].selecionado };
      return updated;
    });
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'urgente': { label: 'Urgente', className: 'bg-red-500/10 text-red-700 border-red-500/30' },
      'alta': { label: 'Alta', className: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
      'media': { label: 'Média', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
      'baixa': { label: 'Baixa', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
    };
    const c = config[prioridade] || config['media'];
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const getResponsavelBadge = (responsavel: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'voce': { label: 'Você', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
      'mentor': { label: 'Mentor', className: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
      'conjunto': { label: 'Conjunto', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
    };
    const c = config[responsavel] || config['voce'];
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const handleSalvar = async () => {
    setIsSaving(true);

    try {
      // Buscar user_id do contrato
      const { data: contrato } = await supabase
        .from("contratos_business")
        .select("user_id")
        .eq("id", contratoId)
        .single();

      if (!contrato) throw new Error("Contrato não encontrado");

      const etapasSelecionadas = etapas.filter(e => e.selecionada);
      const entregasSelecionadas = entregas.filter(e => e.selecionada);
      const instrucoesSelecionadas = instrucoes.filter(i => i.selecionada);
      const tasksSelecionadas = tasks.filter(t => t.selecionada);
      const backlogSelecionado = backlog.filter(b => b.selecionado);

      // 1. Criar Etapas
      const etapasMap: Record<number, string> = {};
      
      if (etapasSelecionadas.length > 0) {
        for (const etapa of etapasSelecionadas) {
          // Verificar se já existe
          const { data: existente } = await supabase
            .from("etapas_business")
            .select("id")
            .eq("contrato_id", contratoId)
            .eq("numero_etapa", etapa.numero)
            .single();

          if (existente) {
            etapasMap[etapa.numero] = existente.id;
          } else {
            const { data: novaEtapa, error } = await supabase
              .from("etapas_business")
              .insert({
                contrato_id: contratoId,
                numero_etapa: etapa.numero,
                titulo: etapa.titulo,
                objetivo: etapa.objetivo,
                status: 'pendente',
              })
              .select()
              .single();

            if (error) throw error;
            etapasMap[etapa.numero] = novaEtapa.id;
          }
        }
      }

      // 2. Criar Entregas
      const entregasMap: Record<number, string> = {};
      
      for (const entrega of entregasSelecionadas) {
        const etapaId = etapasMap[entrega.etapa_numero] || null;
        
        const { data: novaEntrega, error } = await supabase
          .from("entregas_business")
          .insert({
            contrato_id: contratoId,
            etapa_id: etapaId,
            titulo: entrega.titulo,
            descricao: entrega.descricao,
            modulo_relacionado: entrega.modulo_relacionado,
            tipo: entrega.tipo,
            prioridade: entrega.prioridade === 'urgente' ? 'critica' : entrega.prioridade,
            ordem: entrega.numero_entrega,
            tem_instrucoes: instrucoesSelecionadas.some(i => i.entrega_numero === entrega.numero_entrega),
          })
          .select()
          .single();

        if (error) throw error;
        entregasMap[entrega.numero_entrega] = novaEntrega.id;
      }

      // 3. Criar Instruções
      for (const instrucao of instrucoesSelecionadas) {
        const entregaId = entregasMap[instrucao.entrega_numero] || null;
        const entrega = entregasSelecionadas.find(e => e.numero_entrega === instrucao.entrega_numero);
        const etapaId = entrega ? etapasMap[entrega.etapa_numero] : null;

        const { error } = await supabase
          .from("instrucoes_etapa")
          .insert({
            etapa_id: etapaId,
            entrega_id: entregaId,
            titulo: instrucao.titulo,
            descricao: instrucao.descricao,
            responsavel: instrucao.responsavel,
            ferramenta: instrucao.ferramenta || 'outro',
            dicas: instrucao.dicas,
            ordem: instrucao.ordem,
            status: 'pendente',
            gerado_por_ia: true,
          });

        if (error) throw error;
      }

      // 4. Criar Tasks
      for (const task of tasksSelecionadas) {
        const entregaId = entregasMap[task.entrega_numero] || null;
        const entrega = entregasSelecionadas.find(e => e.numero_entrega === task.entrega_numero);
        const etapaId = entrega ? etapasMap[entrega.etapa_numero] : null;

        const { error } = await supabase
          .from("tasks_business")
          .insert({
            contrato_id: contratoId,
            user_id: contrato.user_id,
            entrega_id: entregaId,
            etapa_id: etapaId,
            titulo: task.titulo,
            tipo: task.tipo,
            prioridade: task.prioridade,
            instrucoes_validacao: task.instrucoes_validacao,
            status: 'pendente',
          });

        if (error) throw error;
      }

      // 5. Criar Backlog como entregas futuras
      for (const item of backlogSelecionado) {
        const { error } = await supabase
          .from("entregas_business")
          .insert({
            contrato_id: contratoId,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: 'backlog',
            prioridade: 'baixa',
            justificativa_backlog: item.justificativa,
            ordem: 999,
            tem_instrucoes: false,
          });

        if (error) throw error;
      }

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["etapas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["instrucoes-etapa"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-business", contratoId] });
      
      const totalCriado = etapasSelecionadas.length + entregasSelecionadas.length + 
                         instrucoesSelecionadas.length + tasksSelecionadas.length + 
                         backlogSelecionado.length;
      
      toast.success(`${totalCriado} itens criados com sucesso!`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados");
    } finally {
      setIsSaving(false);
    }
  };

  // Contadores
  const totalEtapas = etapas.filter(e => e.selecionada).length;
  const totalEntregas = entregas.filter(e => e.selecionada).length;
  const totalInstrucoes = instrucoes.filter(i => i.selecionada).length;
  const totalTasks = tasks.filter(t => t.selecionada).length;
  const totalBacklog = backlog.filter(b => b.selecionado).length;

  // Renderizar formato novo (hierárquico)
  const renderNewFormat = () => (
    <div className="space-y-4">
      {etapas.map((etapa) => {
        const isExpanded = expandedEtapas.includes(etapa.numero);
        const entregasDaEtapa = entregas.filter(e => e.etapa_numero === etapa.numero);
        
        return (
          <div key={etapa.numero} className="border rounded-lg overflow-hidden">
            {/* Header da Etapa */}
            <div 
              className="flex items-center gap-3 p-3 bg-muted/50 cursor-pointer hover:bg-muted/70"
              onClick={() => toggleEtapa(etapa.numero)}
            >
              <Checkbox
                checked={etapa.selecionada}
                onCheckedChange={() => toggleEtapaSelecionada(etapa.numero)}
                onClick={(e) => e.stopPropagation()}
              />
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Route className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Fase {etapa.numero}: {etapa.titulo}</p>
                {etapa.objetivo && (
                  <p className="text-xs text-muted-foreground">{etapa.objetivo}</p>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {entregasDaEtapa.length} entregas
              </Badge>
            </div>

            {/* Conteúdo da Etapa */}
            {isExpanded && (
              <div className="p-3 space-y-3">
                {entregasDaEtapa.map((entrega) => {
                  const isEntregaExpanded = expandedEntregas.includes(entrega.numero_entrega);
                  const instrucoesDaEntrega = instrucoes.filter(i => i.entrega_numero === entrega.numero_entrega);
                  const tasksDaEntrega = tasks.filter(t => t.entrega_numero === entrega.numero_entrega);
                  
                  return (
                    <div key={entrega.numero_entrega} className="border rounded-lg bg-background">
                      {/* Header da Entrega */}
                      <div 
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30"
                        onClick={() => toggleEntrega(entrega.numero_entrega)}
                      >
                        <Checkbox
                          checked={entrega.selecionada}
                          onCheckedChange={() => toggleEntregaSelecionada(entrega.numero_entrega)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isEntregaExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Package className="h-4 w-4 text-emerald-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Entrega {entrega.numero_entrega}: {entrega.titulo}
                          </p>
                        </div>
                        {getPrioridadeBadge(entrega.prioridade)}
                      </div>

                      {/* Conteúdo da Entrega */}
                      {isEntregaExpanded && (
                        <div className="px-3 pb-3 space-y-3">
                          <p className="text-xs text-muted-foreground pl-10">
                            {entrega.descricao}
                          </p>

                          {/* Instruções */}
                          {instrucoesDaEntrega.length > 0 && (
                            <div className="pl-10 space-y-2">
                              <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                                Instruções ({instrucoesDaEntrega.filter(i => i.selecionada).length}/{instrucoesDaEntrega.length})
                              </p>
                              {instrucoesDaEntrega.map((instrucao) => (
                                <div 
                                  key={`${instrucao.entrega_numero}-${instrucao.ordem}`}
                                  className="flex items-start gap-2 p-2 rounded bg-muted/30"
                                >
                                  <Checkbox
                                    checked={instrucao.selecionada}
                                    onCheckedChange={() => toggleInstrucaoSelecionada(instrucao.entrega_numero, instrucao.ordem)}
                                    disabled={!entrega.selecionada}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium">{instrucao.ordem}. {instrucao.titulo}</p>
                                    {instrucao.descricao && (
                                      <p className="text-xs text-muted-foreground truncate">{instrucao.descricao}</p>
                                    )}
                                  </div>
                                  {getResponsavelBadge(instrucao.responsavel)}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Tasks */}
                          {tasksDaEntrega.length > 0 && (
                            <div className="pl-10 space-y-2">
                              <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                <CheckSquare className="h-3.5 w-3.5" />
                                Checklist ({tasksDaEntrega.filter(t => t.selecionada).length}/{tasksDaEntrega.length})
                              </p>
                              {tasksDaEntrega.map((task, idx) => (
                                <div 
                                  key={`${task.entrega_numero}-${idx}`}
                                  className="flex items-center gap-2 p-2 rounded bg-muted/30"
                                >
                                  <Checkbox
                                    checked={task.selecionada}
                                    onCheckedChange={() => toggleTaskSelecionada(task.entrega_numero, task.titulo)}
                                    disabled={!entrega.selecionada}
                                  />
                                  <span className="text-xs flex-1">{task.titulo}</span>
                                  {getPrioridadeBadge(task.prioridade)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Renderizar formato antigo (flat)
  const renderOldFormat = () => (
    <div className="space-y-4">
      {entregas.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Package className="h-4 w-4" />
            Entregas ({entregas.filter(e => e.selecionada).length}/{entregas.length})
          </h3>
          
          <div className="space-y-2">
            {entregas.map((entrega) => (
              <div 
                key={entrega.numero_entrega}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <Checkbox
                  checked={entrega.selecionada}
                  onCheckedChange={() => toggleEntregaSelecionada(entrega.numero_entrega)}
                />
                <div className="flex-1">
                  <p className="font-medium">{entrega.titulo}</p>
                  <p className="text-xs text-muted-foreground">{entrega.descricao}</p>
                </div>
                {getPrioridadeBadge(entrega.prioridade)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Estrutura Gerada pela IA
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          {isNewFormat ? renderNewFormat() : renderOldFormat()}

          {/* Backlog */}
          {backlog.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Backlog / Futuras ({backlog.filter(b => b.selecionado).length}/{backlog.length})
                </h3>
                
                <div className="space-y-2">
                  {backlog.map((item, index) => (
                    <div 
                      key={item.titulo}
                      className="flex items-center gap-3 p-3 border rounded-lg border-dashed"
                    >
                      <Checkbox
                        checked={item.selecionado}
                        onCheckedChange={() => toggleBacklog(index)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.titulo}</p>
                        {item.justificativa && (
                          <p className="text-xs text-muted-foreground">
                            "{item.justificativa}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground space-x-3">
            {isNewFormat && <span>{totalEtapas} fases</span>}
            <span>{totalEntregas} entregas</span>
            {isNewFormat && <span>{totalInstrucoes} instruções</span>}
            {isNewFormat && <span>{totalTasks} tasks</span>}
            {totalBacklog > 0 && <span>{totalBacklog} backlog</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvar} 
              disabled={isSaving || (totalEntregas === 0 && totalEtapas === 0)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Selecionados"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
