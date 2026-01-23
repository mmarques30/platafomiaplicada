import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  Eye,
  ClipboardCheck,
  Loader2
} from 'lucide-react';
import { useTasksBusiness, useUpdateTask, useDeleteTask, TaskBusiness } from '@/hooks/useTasksBusiness';
import { useEntregasBusiness } from '@/hooks/useEntregasBusiness';
import { useEtapasBusiness } from '@/hooks/useEtapasBusiness';
import NovaTaskModal from './NovaTaskModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TasksBusinessManagerProps {
  contratoId: string;
  userId: string;
}

const TIPO_LABELS: Record<string, string> = {
  validacao: 'Validação',
  aprovacao: 'Aprovação',
  revisao: 'Revisão',
  homologacao: 'Homologação',
  assinatura: 'Assinatura',
  feedback: 'Feedback',
};

const PRIORIDADE_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  baixa: { label: 'Baixa', variant: 'outline' },
  media: { label: 'Média', variant: 'secondary' },
  alta: { label: 'Alta', variant: 'default' },
  urgente: { label: 'Urgente', variant: 'destructive' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pendente: { label: 'Pendente', icon: <Clock className="h-3.5 w-3.5" />, color: 'text-amber-600' },
  em_analise: { label: 'Em Análise', icon: <Eye className="h-3.5 w-3.5" />, color: 'text-blue-600' },
  aprovado: { label: 'Aprovado', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-600' },
  rejeitado: { label: 'Rejeitado', icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-red-600' },
  revisao_solicitada: { label: 'Revisão', icon: <RotateCcw className="h-3.5 w-3.5" />, color: 'text-orange-600' },
};

const TasksBusinessManager: React.FC<TasksBusinessManagerProps> = ({ contratoId, userId }) => {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading, refetch } = useTasksBusiness(contratoId);
  const { entregas } = useEntregasBusiness(contratoId);
  const { data: etapas } = useEtapasBusiness(contratoId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskBusiness | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pendentes: true,
    em_analise: true,
    concluidas: false,
  });

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from("tasks_business")
        .delete()
        .eq("contrato_id", contratoId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["tasks-business", contratoId] });
      toast.success("Todas as tasks foram removidas");
      refetch();
    } catch (error) {
      console.error("Erro ao limpar:", error);
      toast.error("Erro ao limpar tasks");
    } finally {
      setIsClearing(false);
    }
  };

  const pendentes = tasks?.filter(t => t.status === 'pendente') || [];
  const emAnalise = tasks?.filter(t => t.status === 'em_analise' || t.status === 'revisao_solicitada') || [];
  const concluidas = tasks?.filter(t => t.status === 'aprovado' || t.status === 'rejeitado') || [];

  const getEntregaNome = (entregaId: string | null) => {
    if (!entregaId || !entregas) return null;
    const entrega = entregas.find(e => e.id === entregaId);
    return entrega?.titulo;
  };

  const getEtapaNome = (etapaId: string | null) => {
    if (!etapaId || !etapas) return null;
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa ? `Etapa ${etapa.numero_etapa}` : null;
  };

  const handleEdit = (task: TaskBusiness) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteTaskId) {
      await deleteTask.mutateAsync(deleteTaskId);
      setDeleteTaskId(null);
    }
  };

  const handleApproveFromAdmin = async (taskId: string) => {
    await updateTask.mutateAsync({ id: taskId, status: 'aprovado' });
  };

  const handleRequestRevision = async (taskId: string) => {
    await updateTask.mutateAsync({ id: taskId, status: 'revisao_solicitada' });
  };

  const renderTaskCard = (task: TaskBusiness, showActions = true) => {
    const statusConfig = STATUS_CONFIG[task.status];
    const prioridadeConfig = PRIORIDADE_CONFIG[task.prioridade];
    const entregaNome = getEntregaNome(task.entrega_id);
    const etapaNome = getEtapaNome(task.etapa_id);

    return (
      <div key={task.id} className="p-3 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={statusConfig.color}>{statusConfig.icon}</span>
              <h4 className="font-medium text-sm truncate">{task.titulo}</h4>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              {task.tipo && (
                <Badge variant="outline" className="text-xs">{TIPO_LABELS[task.tipo] || task.tipo}</Badge>
              )}
              <Badge variant={prioridadeConfig.variant} className="text-xs">{prioridadeConfig.label}</Badge>
              {task.prazo && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(task.prazo), "dd/MM", { locale: ptBR })}
                </Badge>
              )}
            </div>

            {task.descricao && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.descricao}</p>
            )}

            {(entregaNome || etapaNome) && (
              <div className="text-xs text-muted-foreground mb-2">
                {entregaNome && <span>Entrega: {entregaNome}</span>}
                {entregaNome && etapaNome && <span className="mx-1.5">•</span>}
                {etapaNome && <span>{etapaNome}</span>}
              </div>
            )}

            <div className="flex gap-1.5">
              {task.documento_url && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <a href={task.documento_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3 w-3 mr-1" />
                    Doc
                  </a>
                </Button>
              )}
              {task.link_referencia && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <a href={task.link_referencia} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Link
                  </a>
                </Button>
              )}
            </div>

            {task.resposta_mentorado && (
              <div className="mt-2 p-2.5 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium mb-0.5">Resposta:</p>
                <p className="text-xs text-muted-foreground">{task.resposta_mentorado}</p>
                {task.data_resposta && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {format(new Date(task.data_resposta), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex flex-col gap-1 shrink-0">
              {task.status === 'em_analise' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleApproveFromAdmin(task.id)}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Aprovar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleRequestRevision(task.id)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Revisar
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(task)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive"
                onClick={() => setDeleteTaskId(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string, 
    tasks: TaskBusiness[], 
    sectionKey: string,
    showActions = true
  ) => (
    <Collapsible
      open={expandedSections[sectionKey]}
      onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, [sectionKey]: open }))}
    >
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
        {expandedSections[sectionKey] ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="font-medium text-sm">{title}</span>
        <Badge variant="secondary" className="ml-auto text-xs">{tasks.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">Nenhuma task</p>
        ) : (
          tasks.map(task => renderTaskCard(task, showActions))
        )}
      </CollapsibleContent>
    </Collapsible>
  );

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Carregando tasks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header compacto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tasks de Validação</h2>
            <Badge variant="secondary" className="text-xs">{tasks?.length || 0}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {(tasks?.length || 0) > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Limpar Tudo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar todas as tasks?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover permanentemente todas as tasks de validação. 
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
            <Button size="sm" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              Nova Task
            </Button>
          </div>
        </div>

        {/* Seções de Tasks */}
        <div className="space-y-3">
          {renderSection('Pendentes', pendentes, 'pendentes')}
          {renderSection('Em Análise / Revisão', emAnalise, 'em_analise')}
          {renderSection('Concluídas', concluidas, 'concluidas', false)}
        </div>
      </div>

      <NovaTaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        contratoId={contratoId}
        userId={userId}
        editingTask={editingTask}
        entregas={entregas || []}
        etapas={etapas || []}
      />

      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Task</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta task? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TasksBusinessManager;
