import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotaProjeto {
  id: string;
  contrato_id: string;
  titulo: string;
  conteudo: string;
  categoria: string;
  ordem: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotaProjetoInput {
  contrato_id: string;
  titulo?: string;
  conteudo?: string;
  categoria?: string;
  ordem?: number;
}

export function useNotasProjetoBusiness(contratoId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["notas-projeto-business", contratoId];

  const { data: notas = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!contratoId) return [];
      const { data, error } = await supabase
        .from("notas_projeto_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as NotaProjeto[];
    },
    enabled: !!contratoId,
  });

  const createNota = useMutation({
    mutationFn: async (input: NotaProjetoInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("notas_projeto_business")
        .insert({ ...input, created_by: userData.user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Anotação criada");
    },
    onError: () => toast.error("Erro ao criar anotação"),
  });

  const updateNota = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotaProjetoInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("notas_projeto_business")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Erro ao atualizar anotação"),
  });

  const deleteNota = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notas_projeto_business")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Anotação removida");
    },
    onError: () => toast.error("Erro ao remover anotação"),
  });

  return { notas, isLoading, createNota, updateNota, deleteNota };
}
