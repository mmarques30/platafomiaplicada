import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CupomVisitante {
  id: string;
  codigo: string;
  desconto_percentual: number;
  descricao: string | null;
  tipo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useCuponsVisitantes() {
  const queryClient = useQueryClient();

  const { data: cupons, isLoading } = useQuery({
    queryKey: ["cupons-visitantes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cupons_visitantes")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CupomVisitante[];
    },
  });

  const createCupom = useMutation({
    mutationFn: async (data: {
      codigo: string;
      desconto_percentual: number;
      descricao?: string;
      tipo?: string;
      ativo?: boolean;
    }) => {
      const { error } = await supabase
        .from("cupons_visitantes")
        .insert({
          codigo: data.codigo,
          desconto_percentual: data.desconto_percentual,
          descricao: data.descricao || null,
          tipo: data.tipo || 'manual',
          ativo: data.ativo ?? true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cupons-visitantes"] });
      toast.success("Cupom criado com sucesso!");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("Já existe um cupom com esse código");
      } else {
        toast.error(error.message || "Erro ao criar cupom");
      }
    },
  });

  const updateCupom = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        codigo: string;
        desconto_percentual: number;
        descricao: string | null;
        tipo: string;
        ativo: boolean;
      }>;
    }) => {
      const { error } = await supabase
        .from("cupons_visitantes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cupons-visitantes"] });
      toast.success("Cupom atualizado com sucesso!");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("Já existe um cupom com esse código");
      } else {
        toast.error(error.message || "Erro ao atualizar cupom");
      }
    },
  });

  const deleteCupom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cupons_visitantes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cupons-visitantes"] });
      toast.success("Cupom excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir cupom");
    },
  });

  return {
    cupons: cupons || [],
    isLoading,
    createCupom,
    updateCupom,
    deleteCupom,
  };
}
