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
  Layers
} from "lucide-react";
import { ResultadoProcessamento, EntregaSugerida } from "@/hooks/useProcessarDocumentos";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeracaoEntregasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultado: ResultadoProcessamento | null;
  contratoId: string;
  onSuccess?: () => void;
}

interface EntregaSelecionada extends EntregaSugerida {
  selecionada: boolean;
  tarefasSelecionadas: boolean[];
}

export function GeracaoEntregasModal({
  open,
  onOpenChange,
  resultado,
  contratoId,
  onSuccess,
}: GeracaoEntregasModalProps) {
  const queryClient = useQueryClient();
  const { bulkCreateEntregas } = useEntregasBusiness(contratoId);
  
  const [entregasAtivas, setEntregasAtivas] = useState<EntregaSelecionada[]>([]);
  const [backlog, setBacklog] = useState<{ titulo: string; descricao: string; justificativa: string; selecionado: boolean }[]>([]);
  const [expandedEntregas, setExpandedEntregas] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (resultado) {
      // Mapear entregas ativas
      const ativas = resultado.entregas_sugeridas
        .filter(e => e.tipo === 'ativa')
        .map(e => ({
          ...e,
          selecionada: true,
          tarefasSelecionadas: e.tarefas.map(() => true),
        }));
      setEntregasAtivas(ativas);

      // Mapear backlog
      const backlogItems = [
        ...resultado.entregas_sugeridas
          .filter(e => e.tipo === 'backlog')
          .map(e => ({
            titulo: e.titulo,
            descricao: e.descricao,
            justificativa: "",
            selecionado: false,
          })),
        ...resultado.backlog_sugerido.map(b => ({
          ...b,
          selecionado: false,
        })),
      ];
      setBacklog(backlogItems);

      // Expandir primeira entrega
      if (ativas.length > 0) {
        setExpandedEntregas([ativas[0].titulo]);
      }
    }
  }, [resultado]);

  const toggleEntrega = (titulo: string) => {
    setExpandedEntregas(prev =>
      prev.includes(titulo)
        ? prev.filter(t => t !== titulo)
        : [...prev, titulo]
    );
  };

  const toggleEntregaSelecionada = (index: number) => {
    setEntregasAtivas(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selecionada: !updated[index].selecionada,
      };
      return updated;
    });
  };

  const toggleTarefa = (entregaIndex: number, tarefaIndex: number) => {
    setEntregasAtivas(prev => {
      const updated = [...prev];
      const tarefas = [...updated[entregaIndex].tarefasSelecionadas];
      tarefas[tarefaIndex] = !tarefas[tarefaIndex];
      updated[entregaIndex] = {
        ...updated[entregaIndex],
        tarefasSelecionadas: tarefas,
      };
      return updated;
    });
  };

  const toggleBacklog = (index: number) => {
    setBacklog(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selecionado: !updated[index].selecionado,
      };
      return updated;
    });
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'alta': { label: 'Alta', className: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
      'media': { label: 'Média', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
      'baixa': { label: 'Baixa', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
    };
    const c = config[prioridade] || config['media'];
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const handleSalvar = async () => {
    setIsSaving(true);

    try {
      // Criar entregas ativas selecionadas
      const entregasParaCriar = entregasAtivas
        .filter(e => e.selecionada)
        .map((e, idx) => ({
          contrato_id: contratoId,
          titulo: e.titulo,
          descricao: e.descricao,
          modulo_relacionado: e.modulo_relacionado,
          tipo: 'ativa' as const,
          prioridade: e.prioridade,
          ordem: idx,
          tem_instrucoes: false, // Por padrão, sem instruções
        }));

      // Criar backlog selecionado
      const backlogParaCriar = backlog
        .filter(b => b.selecionado)
        .map((b, idx) => ({
          contrato_id: contratoId,
          titulo: b.titulo,
          descricao: b.descricao,
          tipo: 'backlog' as const,
          prioridade: 'baixa' as const,
          ordem: entregasParaCriar.length + idx,
          justificativa_backlog: b.justificativa,
          tem_instrucoes: false,
        }));

      const todasEntregas = [...entregasParaCriar, ...backlogParaCriar];

      if (todasEntregas.length === 0) {
        toast.error("Selecione pelo menos uma entrega");
        return;
      }

      // Criar entregas
      const { data: entregasCriadas, error: entregasError } = await supabase
        .from("entregas_business")
        .insert(todasEntregas)
        .select();

      if (entregasError) throw entregasError;

      // Criar tarefas para cada entrega
      const tarefasParaCriar: any[] = [];
      
      entregasAtivas.forEach((entrega, entregaIndex) => {
        if (!entrega.selecionada) return;
        
        const entregaCriada = entregasCriadas.find(e => e.titulo === entrega.titulo);
        if (!entregaCriada) return;

        entrega.tarefas.forEach((tarefa, tarefaIndex) => {
          if (!entrega.tarefasSelecionadas[tarefaIndex]) return;
          
          tarefasParaCriar.push({
            user_id: null, // Será preenchido pelo contrato
            entrega_id: entregaCriada.id,
            titulo: tarefa.titulo,
            descricao: tarefa.descricao || "",
            prioridade: tarefa.prioridade,
            status: "pendente",
            prazo_entrega: null,
          });
        });
      });

      // Buscar user_id do contrato
      const { data: contrato } = await supabase
        .from("contratos_business")
        .select("user_id")
        .eq("id", contratoId)
        .single();

      if (contrato && tarefasParaCriar.length > 0) {
        const tarefasComUser = tarefasParaCriar.map(t => ({
          ...t,
          user_id: contrato.user_id,
        }));

        const { error: tarefasError } = await supabase
          .from("tarefas_mentoria")
          .insert(tarefasComUser);

        if (tarefasError) {
          console.error("Erro ao criar tarefas:", tarefasError);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      queryClient.invalidateQueries({ queryKey: ["tarefas-mentoria"] });
      
      toast.success(`${entregasCriadas.length} entregas e ${tarefasParaCriar.length} tarefas criadas!`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar entregas");
    } finally {
      setIsSaving(false);
    }
  };

  const totalEntregasSelecionadas = entregasAtivas.filter(e => e.selecionada).length + backlog.filter(b => b.selecionado).length;
  const totalTarefasSelecionadas = entregasAtivas
    .filter(e => e.selecionada)
    .reduce((acc, e) => acc + e.tarefasSelecionadas.filter(Boolean).length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sugestões Geradas pela IA
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Entregas Ativas */}
            {entregasAtivas.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Entregas Ativas ({entregasAtivas.filter(e => e.selecionada).length}/{entregasAtivas.length})
                </h3>
                
                <div className="space-y-2">
                  {entregasAtivas.map((entrega, entregaIndex) => {
                    const isExpanded = expandedEntregas.includes(entrega.titulo);
                    
                    return (
                      <div key={entrega.titulo} className="border rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleEntrega(entrega.titulo)}
                        >
                          <Checkbox
                            checked={entrega.selecionada}
                            onCheckedChange={() => toggleEntregaSelecionada(entregaIndex)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{entrega.titulo}</p>
                            {entrega.modulo_relacionado && (
                              <p className="text-xs text-muted-foreground">
                                Módulo: {entrega.modulo_relacionado}
                              </p>
                            )}
                          </div>
                          {getPrioridadeBadge(entrega.prioridade)}
                          <span className="text-xs text-muted-foreground">
                            {entrega.tarefas.length} tarefas
                          </span>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-3 pt-0 space-y-2">
                            <p className="text-sm text-muted-foreground pl-10">
                              {entrega.descricao}
                            </p>
                            
                            <div className="pl-10 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                Tarefas para Validação:
                              </p>
                              {entrega.tarefas.map((tarefa, tarefaIndex) => (
                                <div 
                                  key={tarefaIndex}
                                  className="flex items-center gap-2 p-2 rounded bg-muted/30"
                                >
                                  <Checkbox
                                    checked={entrega.tarefasSelecionadas[tarefaIndex]}
                                    onCheckedChange={() => toggleTarefa(entregaIndex, tarefaIndex)}
                                    disabled={!entrega.selecionada}
                                  />
                                  <span className="text-sm flex-1">{tarefa.titulo}</span>
                                  {getPrioridadeBadge(tarefa.prioridade)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Backlog */}
            {backlog.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Backlog / Entregas Futuras ({backlog.filter(b => b.selecionado).length}/{backlog.length})
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
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {totalEntregasSelecionadas} entregas • {totalTarefasSelecionadas} tarefas
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={isSaving || totalEntregasSelecionadas === 0}>
              {isSaving ? "Salvando..." : "Salvar Selecionados"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
