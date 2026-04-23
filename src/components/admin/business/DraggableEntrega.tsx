import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Package,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckSquare,
  Users,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface DraggableEntregaProps {
  entrega: EntregaSelecionada;
  instrucoes: InstrucaoSelecionada[];
  tasks: TaskSelecionada[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onToggleInstrucao: (entregaNumero: number, ordem: number) => void;
  onToggleTask: (entregaNumero: number, titulo: string) => void;
  onUpdateEntrega: (numeroEntrega: number, patch: Partial<EntregaSelecionada>) => void;
  onRemoveEntrega: (numeroEntrega: number) => void;
  onUpdateInstrucao: (entregaNumero: number, ordem: number, patch: Partial<InstrucaoSelecionada>) => void;
  onRemoveInstrucao: (entregaNumero: number, ordem: number) => void;
  onAddInstrucao: (entregaNumero: number) => void;
  getAcaoBadge: (acao: string) => React.ReactNode;
  getAcaoItem: (tipo: 'entrega', titulo: string) => string;
  getPrioridadeBadge: (prioridade: string) => React.ReactNode;
  getResponsavelBadge: (responsavel: string) => React.ReactNode;
}

const FERRAMENTAS = ['claude', 'lovable', 'reuniao', 'drive', 'notion', 'supabase', 'make', 'n8n', 'zapier', 'mapa', 'outro'];

export function DraggableEntrega({
  entrega,
  instrucoes,
  tasks,
  isExpanded,
  onToggleExpand,
  onToggleSelect,
  onToggleInstrucao,
  onToggleTask,
  onUpdateEntrega,
  onRemoveEntrega,
  onUpdateInstrucao,
  onRemoveInstrucao,
  onAddInstrucao,
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

  const [editingHeader, setEditingHeader] = useState(false);
  const [editingInstrucao, setEditingInstrucao] = useState<number | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const isConjuntas = entrega.is_conjuntas || entrega.responsavel === 'conjunto';
  const instrucoesDaEntrega = instrucoes.filter(i => i.entrega_numero === entrega.numero_entrega);
  const tasksDaEntrega = tasks.filter(t => t.entrega_numero === entrega.numero_entrega);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-background transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-primary/30' : ''} ${
        isConjuntas ? 'border-blue-500/40 bg-blue-500/5' : ''
      }`}
    >
      {/* Header da Entrega */}
      <div className={`flex items-center gap-2 p-3 ${
        isConjuntas ? 'hover:bg-blue-500/10' : 'hover:bg-muted/30'
      }`}>
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
        <div onClick={onToggleExpand} className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          {isConjuntas ? (
            <Users className="h-4 w-4 text-blue-600 shrink-0" />
          ) : (
            <Package className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isConjuntas ? 'text-blue-700' : ''}`}>
              {isConjuntas ? entrega.titulo : `Entrega ${entrega.numero_entrega}: ${entrega.titulo}`}
            </p>
            {instrucoesDaEntrega.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {instrucoesDaEntrega.length} instruções
              </p>
            )}
          </div>
        </div>
        {isConjuntas && (
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/30">
            <Users className="h-3 w-3 mr-1" />
            Conjunta
          </Badge>
        )}
        {getAcaoBadge(getAcaoItem('entrega', entrega.titulo))}
        {!isConjuntas && getPrioridadeBadge(entrega.prioridade)}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={(e) => { e.stopPropagation(); setEditingHeader(v => !v); }}
          title="Editar entrega"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); if (confirm('Remover esta entrega e seus passos?')) onRemoveEntrega(entrega.numero_entrega); }}
          title="Remover entrega"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Edição inline da entrega */}
      {editingHeader && (
        <div className="px-3 pb-3 space-y-2 border-t bg-muted/20 pt-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Título</label>
            <Input
              value={entrega.titulo}
              onChange={(e) => onUpdateEntrega(entrega.numero_entrega, { titulo: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Descrição</label>
            <Textarea
              value={entrega.descricao}
              onChange={(e) => onUpdateEntrega(entrega.numero_entrega, { descricao: e.target.value })}
              className="mt-1 min-h-[60px] text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
              <Select
                value={entrega.prioridade}
                onValueChange={(v) => onUpdateEntrega(entrega.numero_entrega, { prioridade: v })}
              >
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Módulo</label>
              <Input
                value={entrega.modulo_relacionado || ''}
                onChange={(e) => onUpdateEntrega(entrega.numero_entrega, { modulo_relacionado: e.target.value })}
                className="mt-1 h-8 text-sm"
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Entrega */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {!editingHeader && (
            <p className="text-xs text-muted-foreground pl-10">
              {entrega.descricao}
            </p>
          )}

          {/* Instruções */}
          <div className="pl-10 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Instruções ({instrucoesDaEntrega.filter(i => i.selecionada).length}/{instrucoesDaEntrega.length})
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onAddInstrucao(entrega.numero_entrega)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Novo passo
              </Button>
            </div>
            {instrucoesDaEntrega.map((instrucao) => {
              const isEditing = editingInstrucao === instrucao.ordem;
              return (
                <div
                  key={`${instrucao.entrega_numero}-${instrucao.ordem}`}
                  className="rounded bg-muted/30 border"
                >
                  <div className="flex items-start gap-2 p-2">
                    <Checkbox
                      checked={instrucao.selecionada}
                      onCheckedChange={() => onToggleInstrucao(instrucao.entrega_numero, instrucao.ordem)}
                      disabled={!entrega.selecionada}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{instrucao.ordem}. {instrucao.titulo}</p>
                      {instrucao.descricao && !isEditing && (
                        <p className="text-xs text-muted-foreground truncate">{instrucao.descricao}</p>
                      )}
                    </div>
                    {!isEditing && getResponsavelBadge(instrucao.responsavel)}
                    {!isEditing && instrucao.ferramenta && instrucao.ferramenta !== 'outro' && (
                      <Badge variant="outline" className="text-xs">{instrucao.ferramenta}</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setEditingInstrucao(isEditing ? null : instrucao.ordem)}
                    >
                      {isEditing ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => onRemoveInstrucao(instrucao.entrega_numero, instrucao.ordem)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {isEditing && (
                    <div className="p-2 pt-0 space-y-2 border-t bg-background/50">
                      <Input
                        value={instrucao.titulo}
                        onChange={(e) => onUpdateInstrucao(instrucao.entrega_numero, instrucao.ordem, { titulo: e.target.value })}
                        placeholder="Título"
                        className="h-7 text-xs"
                      />
                      <Textarea
                        value={instrucao.descricao || ''}
                        onChange={(e) => onUpdateInstrucao(instrucao.entrega_numero, instrucao.ordem, { descricao: e.target.value })}
                        placeholder="Descrição"
                        className="min-h-[50px] text-xs"
                      />
                      <Textarea
                        value={instrucao.prompt_sugerido || ''}
                        onChange={(e) => onUpdateInstrucao(instrucao.entrega_numero, instrucao.ordem, { prompt_sugerido: e.target.value })}
                        placeholder="Prompt sugerido"
                        className="min-h-[50px] text-xs font-mono"
                      />
                      <Textarea
                        value={instrucao.dicas || ''}
                        onChange={(e) => onUpdateInstrucao(instrucao.entrega_numero, instrucao.ordem, { dicas: e.target.value })}
                        placeholder="Dicas"
                        className="min-h-[40px] text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={instrucao.responsavel}
                          onValueChange={(v) => onUpdateInstrucao(instrucao.entrega_numero, instrucao.ordem, { responsavel: v })}
                        >
                          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Responsável" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="voce">Você</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="conjunto">Conjunto</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={instrucao.ferramenta || 'outro'}
                          onValueChange={(v) => onUpdateInstrucao(instrucao.entrega_numero, instrucao.ordem, { ferramenta: v })}
                        >
                          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Ferramenta" /></SelectTrigger>
                          <SelectContent>
                            {FERRAMENTAS.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingInstrucao(null)}>
                          <Check className="h-3 w-3 mr-1" /> Pronto
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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