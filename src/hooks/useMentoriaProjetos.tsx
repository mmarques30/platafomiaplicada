import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

export type ProjetoMentoria = {
  id: string;
  user_id: string;
  objetivo_id?: string;
  titulo: string;
  descricao: string;
  objetivo_projeto: string;
  contribuicao_plano: string;
  status: "planejamento" | "em_andamento" | "concluido" | "cancelado";
  devolutiva_mentor?: string;
  avaliacao_mentorado?: number;
  avaliacao_mentor?: number;
  comentarios_mentorado?: string;
  comentarios_mentor?: string;
  anexos?: any[];
  data_entrega?: string;
  trilhas_recomendadas?: any[];
  modulos_obrigatorios?: any[];
  progresso_preparacao?: number;
  created_at: string;
  updated_at: string;
};

export const useMentoriaProjetos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projetos, isLoading } = useQuery({
    queryKey: ["projetos-mentoria", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("projetos_mentoria")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjetoMentoria[];
    },
    enabled: !!user,
  });

  const createProjeto = useMutation({
    mutationFn: async (projeto: Partial<ProjetoMentoria>) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("projetos_mentoria")
        .insert([{ ...projeto, user_id: user.id } as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria"] });
      toast({
        title: "Projeto criado!",
        description: "O projeto foi adicionado ao seu portfólio"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateProjeto = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjetoMentoria> & { id: string }) => {
      const { data, error } = await supabase
        .from("projetos_mentoria")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos-mentoria"] });
      toast({
        title: "Projeto atualizado!",
        description: "As alterações foram salvas"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    projetos: projetos || [],
    isLoading,
    createProjeto: createProjeto.mutate,
    updateProjeto: updateProjeto.mutate,
    isCreating: createProjeto.isPending,
    isUpdating: updateProjeto.isPending
  };
};
