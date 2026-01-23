import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Package, ChevronDown, ChevronRight, FileText, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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

interface DraggableEntregaProps {
  entrega: EntregaSelecionada;
  instrucoes: InstrucaoSelecionada[];
  tasks: TaskSelecionada[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onToggleInstrucao: (entregaNumero: number, ordem: number) => void;
  onToggleTask: (entregaNumero: number, titulo: string) => void;
  getAcaoBadge: (acao: string) => React.ReactNode;
  getAcaoItem: (tipo: 'entrega', titulo: string) => string;
  getPrioridadeBadge: (prioridade: string) => React.ReactNode;
  getResponsavelBadge: (responsavel: string) => React.ReactNode;
}

export function DraggableEntrega({
  entrega,
  instrucoes,
  tasks,
  isExpanded,
  onToggleExpand,
  onToggleSelect,
  onToggleInstrucao,
  onToggleTask,
  getAcaoBadge,
  getAcaoItem,
  getPrioridadeBadge,
  getResponsavelBadge,
}: DraggableEntregaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entrega.numero_entrega });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const instrucoesDaEntrega = instrucoes.filter(i => i.entrega_numero === entrega.numero_entrega);
  const tasksDaEntrega = tasks.filter(t => t.entrega_numero === entrega.numero_entrega);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-background transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-primary/30' : ''}`}
    >
      {/* Header da Entrega */}
      <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30">
        {/* Handle de Drag */}
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <Checkbox
          checked={entrega.selecionada}
          onCheckedChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
        <div onClick={onToggleExpand} className="flex items-center gap-2 flex-1 cursor-pointer">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Package className="h-4 w-4 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Entrega {entrega.numero_entrega}: {entrega.titulo}
            </p>
            {instrucoesDaEntrega.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {instrucoesDaEntrega.length} instruções
              </p>
            )}
          </div>
        </div>
        {getAcaoBadge(getAcaoItem('entrega', entrega.titulo))}
        {getPrioridadeBadge(entrega.prioridade)}
      </div>

      {/* Conteúdo da Entrega */}
      {isExpanded && (
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
                    onCheckedChange={() => onToggleInstrucao(instrucao.entrega_numero, instrucao.ordem)}
                    disabled={!entrega.selecionada}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{instrucao.ordem}. {instrucao.titulo}</p>
                    {instrucao.descricao && (
                      <p className="text-xs text-muted-foreground truncate">{instrucao.descricao}</p>
                    )}
                  </div>
                  {getResponsavelBadge(instrucao.responsavel)}
                  {instrucao.ferramenta && instrucao.ferramenta !== 'outro' && (
                    <Badge variant="outline" className="text-xs">
                      {instrucao.ferramenta}
                    </Badge>
                  )}
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
                    onCheckedChange={() => onToggleTask(task.entrega_numero, task.titulo)}
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
}
