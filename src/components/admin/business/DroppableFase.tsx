import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight, FolderOpen, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  getAcaoBadge,
  getAcaoItem,
  getPrioridadeBadge,
  getResponsavelBadge,
  getProgressColor,
}: DroppableFaseProps) {
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
                getAcaoBadge={getAcaoBadge}
                getAcaoItem={getAcaoItem}
                getPrioridadeBadge={getPrioridadeBadge}
                getResponsavelBadge={getResponsavelBadge}
              />
            ))}
          </SortableContext>
          
          {entregas.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Arraste entregas para esta fase
            </div>
          )}
        </div>
      )}
    </div>
  );
}
