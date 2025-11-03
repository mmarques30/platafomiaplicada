import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type ObjetivoMentoria = {
  id: string;
  user_id: string;
  objetivo: string;
  prazo?: string;
  status: "em_andamento" | "concluido" | "cancelado";
  progresso?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
};

export const useMentoriaObjetivos = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: objetivos, isLoading } = useQuery({
    queryKey: ["objetivos-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("objetivos_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ObjetivoMentoria[];
    },
    enabled: !!targetUserId,
  });

  const createObjetivo = useMutation({
    mutationFn: async (objetivo: Partial<ObjetivoMentoria>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("objetivos_mentoria")
        .insert([{ ...objetivo, user_id: objetivo.user_id || user.id } as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objetivos-mentoria"] });
      toast({
        title: "Objetivo criado!",
        description: "O objetivo foi adicionado com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar objetivo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateObjetivo = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ObjetivoMentoria> & { id: string }) => {
      const { data, error } = await supabase
        .from("objetivos_mentoria")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objetivos-mentoria"] });
      toast({
        title: "Objetivo atualizado!",
        description: "As alterações foram salvas"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar objetivo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteObjetivo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("objetivos_mentoria")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objetivos-mentoria"] });
      toast({
        title: "Objetivo removido",
        description: "O objetivo foi excluído"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover objetivo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const { data: projetosPorObjetivo } = useQuery({
    queryKey: ["projetos-por-objetivo", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return {};
      
      const { data, error } = await supabase
        .from("projetos_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .not("objetivo_id", "is", null);

      if (error) throw error;
      
      const grouped = (data || []).reduce((acc: any, projeto: any) => {
        const objId = projeto.objetivo_id;
        if (!acc[objId]) acc[objId] = [];
        acc[objId].push(projeto);
        return acc;
      }, {});
      
      return grouped;
    },
    enabled: !!targetUserId,
  });

  return {
    objetivos: objetivos || [],
    projetosPorObjetivo: projetosPorObjetivo || {},
    isLoading,
    createObjetivo: createObjetivo.mutate,
    updateObjetivo: updateObjetivo.mutate,
    deleteObjetivo: deleteObjetivo.mutate,
    isCreating: createObjetivo.isPending,
    isUpdating: updateObjetivo.isPending,
    isDeleting: deleteObjetivo.isPending
  };
};
