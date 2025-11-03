import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type RecursoMentoria = {
  id: string;
  user_id: string;
  nome: string;
  descricao: string;
  link?: string;
  categoria: string;
  para_que_serve: string;
  como_usar?: string;
  created_at: string;
  updated_at: string;
};

export const useMentoriaRecursos = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: recursos, isLoading } = useQuery({
    queryKey: ["recursos-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("recursos_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RecursoMentoria[];
    },
    enabled: !!targetUserId,
  });

  const createRecurso = useMutation({
    mutationFn: async (recurso: Partial<RecursoMentoria>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("recursos_mentoria")
        .insert([{ ...recurso, user_id: user.id } as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recursos-mentoria"] });
      toast({
        title: "Recurso adicionado!",
        description: "O recurso foi adicionado à sua lista"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar recurso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateRecurso = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecursoMentoria> & { id: string }) => {
      const { data, error } = await supabase
        .from("recursos_mentoria")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recursos-mentoria"] });
      toast({
        title: "Recurso atualizado!",
        description: "As informações foram salvas"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar recurso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteRecurso = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recursos_mentoria")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recursos-mentoria"] });
      toast({
        title: "Recurso removido",
        description: "O recurso foi excluído da sua lista"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover recurso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    recursos: recursos || [],
    isLoading,
    createRecurso: createRecurso.mutate,
    updateRecurso: updateRecurso.mutate,
    deleteRecurso: deleteRecurso.mutate,
    isCreating: createRecurso.isPending,
    isUpdating: updateRecurso.isPending,
    isDeleting: deleteRecurso.isPending
  };
};
