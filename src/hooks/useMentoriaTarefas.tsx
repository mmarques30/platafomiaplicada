import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type TarefaMentoria = {
  id: string;
  user_id: string;
  projeto_id?: string;
  sessao_id?: string;
  titulo: string;
  descricao: string;
  tipo: 'entrega' | 'leitura' | 'exercicio' | 'revisao';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  data_acordo: string;
  prazo_entrega: string;
  data_conclusao?: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada' | 'cancelada';
  arquivo_entrega_url?: string;
  link_externo?: string;
  feedback_mentor?: string;
  avaliacao_mentor?: number;
  created_at: string;
  updated_at: string;
};

export const useMentoriaTarefas = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: tarefas, isLoading } = useQuery({
    queryKey: ["tarefas-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("tarefas_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("prazo_entrega", { ascending: true });

      if (error) throw error;
      return data as TarefaMentoria[];
    },
    enabled: !!targetUserId,
  });

  const createTarefa = useMutation({
    mutationFn: async (tarefa: Partial<TarefaMentoria>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("tarefas_mentoria")
        .insert([{ ...tarefa, user_id: tarefa.user_id || user.id } as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas-mentoria"] });
      toast({
        title: "Tarefa criada!",
        description: "A tarefa foi adicionada com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateTarefa = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TarefaMentoria> & { id: string }) => {
      const { data, error } = await supabase
        .from("tarefas_mentoria")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Tarefa não encontrada");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas-mentoria"] });
      toast({
        title: "Tarefa atualizada!",
        description: "As alterações foram salvas"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteTarefa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tarefas_mentoria")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas-mentoria"] });
      toast({
        title: "Tarefa removida",
        description: "A tarefa foi excluída"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover tarefa",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const uploadEntrega = useMutation({
    mutationFn: async ({ file, tarefaId, userId }: { file: File; tarefaId: string; userId: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${tarefaId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('entregas-mentoria')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('entregas-mentoria')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('tarefas_mentoria')
        .update({ arquivo_entrega_url: publicUrl })
        .eq('id', tarefaId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas-mentoria"] });
      toast({
        title: "Entrega enviada!",
        description: "O arquivo foi anexado à tarefa"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar entrega",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    tarefas: tarefas || [],
    isLoading,
    createTarefa: createTarefa.mutate,
    updateTarefa: updateTarefa.mutate,
    deleteTarefa: deleteTarefa.mutate,
    uploadEntrega: uploadEntrega.mutate,
    isCreating: createTarefa.isPending,
    isUpdating: updateTarefa.isPending,
    isDeleting: deleteTarefa.isPending,
    isUploading: uploadEntrega.isPending
  };
};
