import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight, FolderOpen, Zap, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { DraggableEntrega } from "./DraggableEntrega";

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
  responsavel?: string;
  status?: string;
  selecionada: boolean;
  is_conjuntas?: boolean;
  is_grouped?: boolean;
  subitens_count?: number;
  subitens_concluidos?: number;
}

interface InstrucaoSelecionada {
  entrega_numero: number;
  titulo: string;
  descricao?: string;
  prompt_sugerido?: string;
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

interface FaseCores {
  bg: string;
  border: string;
  text: string;
  icon: string;
  headerBg: string;
}

interface TotaisFase {
  entregas: number;
  entregasConcluidas: number;
  instrucoes: number;
  instrucoesConcluidas: number;
  tasks: number;
  porcentagem: number;
}

interface DroppableFaseProps {
  etapa: EtapaSelecionada;
  entregas: EntregaSelecionada[];
  instrucoes: InstrucaoSelecionada[];
  tasks: TaskSelecionada[];
  cores: FaseCores;
  totais: TotaisFase;
  isExpanded: boolean;
  expandedEntregas: number[];
  isPrioritaria: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onToggleEntrega: (numero: number) => void;
  onToggleEntregaSelect: (numero: number) => void;
  onToggleInstrucao: (entregaNumero: number, ordem: number) => void;
  onToggleTask: (entregaNumero: number, titulo: string) => void;
  onUpdateEtapa: (numero: number, patch: Partial<EtapaSelecionada>) => void;
  onRemoveEtapa: (numero: number) => void;
  onAddEntrega: (etapaNumero: number) => void;
  onUpdateEntrega: (numeroEntrega: number, patch: Partial<EntregaSelecionada>) => void;
  onRemoveEntrega: (numeroEntrega: number) => void;
  onUpdateInstrucao: (entregaNumero: number, ordem: number, patch: Partial<InstrucaoSelecionada>) => void;
  onRemoveInstrucao: (entregaNumero: number, ordem: number) => void;
  onAddInstrucao: (entregaNumero: number) => void;
  getAcaoBadge: (acao: string) => React.ReactNode;
  getAcaoItem: (tipo: 'etapa' | 'entrega', titulo: string) => string;
  getPrioridadeBadge: (prioridade: string) => React.ReactNode;
  getResponsavelBadge: (responsavel: string) => React.ReactNode;
  getProgressColor: (faseNumero: number, porcentagem: number) => string;
}

export function DroppableFase({
  etapa,
  entregas,
  instrucoes,
  tasks,
  cores,
  totais,
  isExpanded,
  expandedEntregas,
  isPrioritaria,
  onToggleExpand,
  onToggleSelect,
  onToggleEntrega,
  onToggleEntregaSelect,
  onToggleInstrucao,
  onToggleTask,
  onUpdateEtapa,
  onRemoveEtapa,
  onAddEntrega,
  onUpdateEntrega,
  onRemoveEntrega,
  onUpdateInstrucao,
  onRemoveInstrucao,
  onAddInstrucao,
  getAcaoBadge,
  getAcaoItem,
  getPrioridadeBadge,
  getResponsavelBadge,
  getProgressColor,
}: DroppableFaseProps) {
  const [editingFase, setEditingFase] = useState(false);
  const { isOver, setNodeRef } = useDroppable({
    id: `fase-${etapa.numero}`,
    data: { faseNumero: etapa.numero },
  });

  const entregaIds = entregas.map(e => e.numero_entrega);

  return (
    <div 
      ref={setNodeRef}
      className={`border rounded-lg overflow-hidden transition-all duration-200 ${cores.border} ${
        isOver ? 'ring-2 ring-primary ring-offset-2 scale-[1.01]' : ''
      }`}
    >
      {/* Header da FASE */}
      <div 
        className={`flex flex-col gap-2 p-3 cursor-pointer ${cores.headerBg}`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={etapa.selecionada}
            onCheckedChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
          />
          {isExpanded ? (
            <ChevronDown className={`h-4 w-4 ${cores.icon}`} />
          ) : (
            <ChevronRight className={`h-4 w-4 ${cores.icon}`} />
          )}
          <FolderOpen className={`h-4 w-4 ${cores.icon}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${cores.text}`}>
                FASE {etapa.numero}: {etapa.titulo.toUpperCase()}
              </p>
              {isPrioritaria && (
                <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-700 border-amber-500/40">
                  <Zap className="h-3 w-3 mr-1" />
                  Prioridade
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {totais.entregasConcluidas}/{totais.entregas} entregas • {totais.instrucoesConcluidas}/{totais.instrucoes} instruções • {totais.tasks} tasks
            </p>
          </div>
          <span className={`text-sm font-semibold ${totais.porcentagem === 100 ? 'text-emerald-600' : cores.text}`}>
            {totais.porcentagem}%
          </span>
          {getAcaoBadge(getAcaoItem('etapa', etapa.titulo))}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); setEditingFase(v => !v); }}
            title={editingFase ? "Fechar edição" : "Editar fase"}
          >
            {editingFase ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); if (confirm('Remover esta fase e suas entregas?')) onRemoveEtapa(etapa.numero); }}
            title="Remover fase"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {/* Barra de Progresso */}
        <div className="ml-10 mr-4">
          <Progress 
            value={totais.porcentagem} 
            className="h-1.5 bg-background/50"
            indicatorClassName={getProgressColor(etapa.numero, totais.porcentagem)}
          />
        </div>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && isExpanded && (
        <div className="mx-3 mt-3 p-3 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 text-center">
          <p className="text-sm text-primary font-medium">
            Solte aqui para mover para Fase {etapa.numero}
          </p>
        </div>
      )}

      {/* Edição inline da fase */}
      {editingFase && (
        <div className={`px-4 py-3 space-y-2 border-t ${cores.bg}`}>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Título da fase</label>
            <Input
              value={etapa.titulo}
              onChange={(e) => onUpdateEtapa(etapa.numero, { titulo: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Objetivo</label>
            <Textarea
              value={etapa.objetivo || ''}
              onChange={(e) => onUpdateEtapa(etapa.numero, { objetivo: e.target.value })}
              className="mt-1 min-h-[50px] text-sm"
              placeholder="Objetivo da fase (opcional)"
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingFase(false)}>
              <Check className="h-3 w-3 mr-1" /> Pronto
            </Button>
          </div>
        </div>
      )}

      {/* Entregas da FASE */}
      {isExpanded && (
        <div className={`p-3 space-y-3 ${cores.bg}`}>
          <SortableContext items={entregaIds} strategy={verticalListSortingStrategy}>
            {entregas.map((entrega) => (
              <DraggableEntrega
                key={entrega.numero_entrega}
                entrega={entrega}
                instrucoes={instrucoes}
                tasks={tasks}
                isExpanded={expandedEntregas.includes(entrega.numero_entrega)}
                onToggleExpand={() => onToggleEntrega(entrega.numero_entrega)}
                onToggleSelect={() => onToggleEntregaSelect(entrega.numero_entrega)}
                onToggleInstrucao={onToggleInstrucao}
                onToggleTask={onToggleTask}
                onUpdateEntrega={onUpdateEntrega}
                onRemoveEntrega={onRemoveEntrega}
                onUpdateInstrucao={onUpdateInstrucao}
                onRemoveInstrucao={onRemoveInstrucao}
                onAddInstrucao={onAddInstrucao}
                getAcaoBadge={getAcaoBadge}
                getAcaoItem={getAcaoItem}
                getPrioridadeBadge={getPrioridadeBadge}
                getResponsavelBadge={getResponsavelBadge}
              />
            ))}
          </SortableContext>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAddEntrega(etapa.numero)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova entrega nesta fase
          </Button>

          {entregas.length === 0 && (
            <div className="p-3 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
              Arraste entregas para esta fase ou crie uma nova acima
            </div>
          )}
        </div>
      )}
    </div>
  );
}
