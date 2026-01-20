import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskBusiness {
  id: string;
  contrato_id: string | null;
  user_id: string;
  titulo: string;
  descricao: string | null;
  tipo: 'validacao' | 'aprovacao' | 'revisao' | 'homologacao' | 'assinatura' | 'feedback' | null;
  status: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'revisao_solicitada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  prazo: string | null;
  entrega_id: string | null;
  etapa_id: string | null;
  documento_url: string | null;
  link_referencia: string | null;
  instrucoes_validacao: string | null;
  resposta_mentorado: string | null;
  data_resposta: string | null;
  arquivo_resposta_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  contrato_id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  tipo?: TaskBusiness['tipo'];
  prioridade?: TaskBusiness['prioridade'];
  prazo?: string;
  entrega_id?: string;
  etapa_id?: string;
  documento_url?: string;
  link_referencia?: string;
  instrucoes_validacao?: string;
  created_by?: string;
}

export interface UpdateTaskInput {
  id: string;
  titulo?: string;
  descricao?: string;
  tipo?: TaskBusiness['tipo'];
  status?: TaskBusiness['status'];
  prioridade?: TaskBusiness['prioridade'];
  prazo?: string;
  entrega_id?: string | null;
  etapa_id?: string | null;
  documento_url?: string;
  link_referencia?: string;
  instrucoes_validacao?: string;
  resposta_mentorado?: string;
  data_resposta?: string;
  arquivo_resposta_url?: string;
}

export function useTasksBusiness(contratoId?: string) {
  return useQuery({
    queryKey: ['tasks-business', contratoId],
    queryFn: async () => {
      let query = supabase
        .from('tasks_business')
        .select('*')
        .order('created_at', { ascending: false });

      if (contratoId) {
        query = query.eq('contrato_id', contratoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TaskBusiness[];
    },
    enabled: !!contratoId,
  });
}

export function useTasksByUser(userId?: string) {
  return useQuery({
    queryKey: ['tasks-business-user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks_business')
        .select('*')
        .eq('user_id', userId!)
        .order('prazo', { ascending: true });

      if (error) throw error;
      return data as TaskBusiness[];
    },
    enabled: !!userId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from('tasks_business')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-business', variables.contrato_id] });
      queryClient.invalidateQueries({ queryKey: ['tasks-business-user', variables.user_id] });
      toast.success('Task criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar task:', error);
      toast.error('Erro ao criar task');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('tasks_business')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-business'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-business-user'] });
      toast.success('Task atualizada!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar task:', error);
      toast.error('Erro ao atualizar task');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks_business')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-business'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-business-user'] });
      toast.success('Task excluída!');
    },
    onError: (error) => {
      console.error('Erro ao excluir task:', error);
      toast.error('Erro ao excluir task');
    },
  });
}

export function useRespondTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      taskId, 
      resposta, 
      status, 
      arquivoUrl 
    }: { 
      taskId: string; 
      resposta: string; 
      status: 'aprovado' | 'rejeitado' | 'revisao_solicitada';
      arquivoUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from('tasks_business')
        .update({
          resposta_mentorado: resposta,
          status,
          data_resposta: new Date().toISOString(),
          arquivo_resposta_url: arquivoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-business'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-business-user'] });
      toast.success('Resposta enviada!');
    },
    onError: (error) => {
      console.error('Erro ao responder task:', error);
      toast.error('Erro ao enviar resposta');
    },
  });
}
