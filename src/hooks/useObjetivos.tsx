import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ObjetivoMentoria {
  id: string;
  user_id: string;
  formulario_id: string | null;
  objetivo: string;
  tipo: string;
  prioridade: number;
  status: string;
  gerado_por_ia: boolean;
  created_at: string;
  updated_at: string;
}

export function useObjetivos() {
  const { data: objetivos, isLoading } = useQuery({
    queryKey: ["objetivos-mentoria"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("objetivos_mentoria")
        .select("*")
        .eq("user_id", user.id)
        .order("prioridade", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ObjetivoMentoria[];
    },
  });

  return { objetivos, isLoading };
}

export function useUpdateObjetivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ObjetivoMentoria> }) => {
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
        title: "Objetivo atualizado",
        description: "As alterações foram salvas com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar objetivo",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });
}