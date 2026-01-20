import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  Eye,
  RotateCcw
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
} from "@/components/ui/alert-dialog";

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
  baixa: { label: 'Baixa', variant: 'secondary' },
  media: { label: 'Média', variant: 'default' },
  alta: { label: 'Alta', variant: 'destructive' },
  urgente: { label: 'Urgente', variant: 'destructive' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pendente: { label: 'Pendente', icon: <Clock className="h-4 w-4" />, color: 'text-yellow-600' },
  em_analise: { label: 'Em Análise', icon: <Eye className="h-4 w-4" />, color: 'text-blue-600' },
  aprovado: { label: 'Aprovado', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-600' },
  rejeitado: { label: 'Rejeitado', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600' },
  revisao_solicitada: { label: 'Revisão Solicitada', icon: <RotateCcw className="h-4 w-4" />, color: 'text-orange-600' },
};

const TasksBusinessManager: React.FC<TasksBusinessManagerProps> = ({ contratoId, userId }) => {
  const { data: tasks, isLoading } = useTasksBusiness(contratoId);
  const { entregas } = useEntregasBusiness(contratoId);
  const { data: etapas } = useEtapasBusiness(contratoId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskBusiness | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pendentes: true,
    em_analise: true,
    concluidas: false,
  });

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
    return etapa ? `Etapa ${etapa.numero_etapa}: ${etapa.titulo}` : null;
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
      <Card key={task.id} className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={statusConfig.color}>{statusConfig.icon}</span>
                <h4 className="font-medium">{task.titulo}</h4>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {task.tipo && (
                  <Badge variant="outline">{TIPO_LABELS[task.tipo] || task.tipo}</Badge>
                )}
                <Badge variant={prioridadeConfig.variant}>{prioridadeConfig.label}</Badge>
                {task.prazo && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.prazo), "dd/MM/yyyy", { locale: ptBR })}
                  </Badge>
                )}
              </div>

              {task.descricao && (
                <p className="text-sm text-muted-foreground mb-2">{task.descricao}</p>
              )}

              {(entregaNome || etapaNome) && (
                <div className="text-xs text-muted-foreground mb-2">
                  {entregaNome && <span>Entrega: {entregaNome}</span>}
                  {entregaNome && etapaNome && <span className="mx-2">•</span>}
                  {etapaNome && <span>{etapaNome}</span>}
                </div>
              )}

              <div className="flex gap-2">
                {task.documento_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={task.documento_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-1" />
                      Documento
                    </a>
                  </Button>
                )}
                {task.link_referencia && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={task.link_referencia} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Link
                    </a>
                  </Button>
                )}
              </div>

              {task.resposta_mentorado && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-1">Resposta do mentorado:</p>
                  <p className="text-sm">{task.resposta_mentorado}</p>
                  {task.data_resposta && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Respondido em {format(new Date(task.data_resposta), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex flex-col gap-1">
                {task.status === 'em_analise' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleApproveFromAdmin(task.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRequestRevision(task.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Pedir Revisão
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => setDeleteTaskId(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left mb-3">
        {expandedSections[sectionKey] ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="font-medium">{title}</span>
        <Badge variant="secondary">{tasks.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Nenhuma task nesta categoria</p>
        ) : (
          tasks.map(task => renderTaskCard(task, showActions))
        )}
      </CollapsibleContent>
    </Collapsible>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando tasks...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Tasks de Validação
          </CardTitle>
          <Button onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Task
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderSection('Pendentes', pendentes, 'pendentes')}
          {renderSection('Em Análise / Revisão', emAnalise, 'em_analise')}
          {renderSection('Concluídas', concluidas, 'concluidas', false)}
        </CardContent>
      </Card>

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
