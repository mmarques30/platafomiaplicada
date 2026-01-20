import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTask, useUpdateTask, TaskBusiness, CreateTaskInput } from '@/hooks/useTasksBusiness';
import { useAuth } from '@/hooks/useAuth';

interface EntregaBusiness {
  id: string;
  titulo: string;
}

interface EtapaBusiness {
  id: string;
  numero_etapa: number;
  titulo: string;
}

interface NovaTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contratoId: string;
  userId: string;
  editingTask: TaskBusiness | null;
  entregas: EntregaBusiness[];
  etapas: EtapaBusiness[];
}

interface FormData {
  titulo: string;
  descricao: string;
  tipo: string;
  prioridade: string;
  prazo: string;
  entrega_id: string;
  etapa_id: string;
  link_referencia: string;
  instrucoes_validacao: string;
}

const NovaTaskModal: React.FC<NovaTaskModalProps> = ({
  open,
  onOpenChange,
  contratoId,
  userId,
  editingTask,
  entregas,
  etapas,
}) => {
  const { user } = useAuth();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      titulo: '',
      descricao: '',
      tipo: 'validacao',
      prioridade: 'media',
      prazo: '',
      entrega_id: '',
      etapa_id: '',
      link_referencia: '',
      instrucoes_validacao: '',
    },
  });

  useEffect(() => {
    if (editingTask) {
      setValue('titulo', editingTask.titulo);
      setValue('descricao', editingTask.descricao || '');
      setValue('tipo', editingTask.tipo || 'validacao');
      setValue('prioridade', editingTask.prioridade || 'media');
      setValue('prazo', editingTask.prazo || '');
      setValue('entrega_id', editingTask.entrega_id || '');
      setValue('etapa_id', editingTask.etapa_id || '');
      setValue('link_referencia', editingTask.link_referencia || '');
      setValue('instrucoes_validacao', editingTask.instrucoes_validacao || '');
    } else {
      reset();
    }
  }, [editingTask, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Tratar "none" e string vazia como valores nulos
      const isValidUuid = (val: string | undefined) => val && val !== 'none' && val.length > 0;
      
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          titulo: data.titulo,
          descricao: data.descricao || undefined,
          tipo: data.tipo as TaskBusiness['tipo'],
          prioridade: data.prioridade as TaskBusiness['prioridade'],
          prazo: data.prazo || undefined,
          entrega_id: isValidUuid(data.entrega_id) ? data.entrega_id : null,
          etapa_id: isValidUuid(data.etapa_id) ? data.etapa_id : null,
          link_referencia: data.link_referencia || undefined,
          instrucoes_validacao: data.instrucoes_validacao || undefined,
        });
      } else {
        const input: CreateTaskInput = {
          contrato_id: contratoId,
          user_id: userId,
          titulo: data.titulo,
          descricao: data.descricao || undefined,
          tipo: data.tipo as TaskBusiness['tipo'],
          prioridade: data.prioridade as TaskBusiness['prioridade'],
          prazo: data.prazo || undefined,
          entrega_id: isValidUuid(data.entrega_id) ? data.entrega_id : undefined,
          etapa_id: isValidUuid(data.etapa_id) ? data.etapa_id : undefined,
          link_referencia: data.link_referencia || undefined,
          instrucoes_validacao: data.instrucoes_validacao || undefined,
          created_by: user?.id,
        };
        await createTask.mutateAsync(input);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Erro ao salvar task:', error);
    }
  };

  const isSubmitting = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Editar Task' : 'Nova Task de Validação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              placeholder="Ex: Validar layout do CRM"
              {...register('titulo', { required: 'Título é obrigatório' })}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={watch('tipo')}
                onValueChange={(value) => setValue('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="validacao">Validação</SelectItem>
                  <SelectItem value="aprovacao">Aprovação</SelectItem>
                  <SelectItem value="revisao">Revisão</SelectItem>
                  <SelectItem value="homologacao">Homologação</SelectItem>
                  <SelectItem value="assinatura">Assinatura</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={watch('prioridade')}
                onValueChange={(value) => setValue('prioridade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prazo">Prazo</Label>
            <Input
              id="prazo"
              type="date"
              {...register('prazo')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vincular a Entrega</Label>
              <Select
                value={watch('entrega_id')}
                onValueChange={(value) => setValue('entrega_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {entregas.map((entrega) => (
                    <SelectItem key={entrega.id} value={entrega.id}>
                      {entrega.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vincular a Etapa</Label>
              <Select
                value={watch('etapa_id')}
                onValueChange={(value) => setValue('etapa_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa.id} value={etapa.id}>
                      Etapa {etapa.numero_etapa}: {etapa.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva a task..."
              rows={3}
              {...register('descricao')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instrucoes_validacao">Instruções de Validação</Label>
            <Textarea
              id="instrucoes_validacao"
              placeholder="1. Verificar se todos os campos estão presentes&#10;2. Testar o fluxo de cadastro&#10;3. Aprovar ou solicitar ajustes"
              rows={4}
              {...register('instrucoes_validacao')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_referencia">Link de Referência</Label>
            <Input
              id="link_referencia"
              type="url"
              placeholder="https://figma.com/design/..."
              {...register('link_referencia')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editingTask ? 'Salvar Alterações' : 'Criar Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaTaskModal;
