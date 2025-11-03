import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type SessaoMentoria = {
  id: string;
  user_id: string;
  titulo: string;
  data_sessao: string;
  duracao?: number;
  transcricao?: string;
  transcricao_url?: string;
  video_url?: string;
  notas?: string;
  status: "agendada" | "realizada" | "cancelada";
  created_at: string;
  updated_at: string;
};

export const useMentoriaSessoes = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: sessoes, isLoading } = useQuery({
    queryKey: ["sessoes-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("sessoes_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("data_sessao", { ascending: false });

      if (error) throw error;
      return data as SessaoMentoria[];
    },
    enabled: !!targetUserId,
  });

  const createSessao = useMutation({
    mutationFn: async (sessao: Partial<SessaoMentoria>) => {
      const { data, error } = await supabase
        .from("sessoes_mentoria")
        .insert([sessao as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessoes-mentoria"] });
      toast({
        title: "Sessão criada com sucesso!",
        description: "A sessão foi adicionada ao seu histórico"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar sessão",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSessao = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SessaoMentoria> & { id: string }) => {
      const { data, error } = await supabase
        .from("sessoes_mentoria")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessoes-mentoria"] });
      toast({
        title: "Sessão atualizada!",
        description: "As informações foram salvas com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar sessão",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    sessoes: sessoes || [],
    isLoading,
    createSessao: createSessao.mutate,
    updateSessao: updateSessao.mutate,
    isCreating: createSessao.isPending,
    isUpdating: updateSessao.isPending
  };
};
