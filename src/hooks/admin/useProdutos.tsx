import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Produto {
  id: string;
  slug: string;
  nome: string;
  tipo: 'b2c' | 'b2b';
  formato: string;
  valor: number;
  valor_com_desconto?: number;
  periodicidade?: string;
  duracao?: string;
  descricao_curta: string;
  descricao_completa: string;
  beneficios: string[];
  ordem: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegraUpsell {
  id: string;
  produto_origem_id: string;
  produto_destino_id: string;
  valor_desconto: number;
  economia: number;
  descricao_oferta: string;
  ativo: boolean;
  produto_origem?: Produto;
  produto_destino?: Produto;
}

export function useProdutos() {
  return useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("ordem");

      if (error) throw error;
      return data as Produto[];
    },
  });
}

export function useRegrasUpsell() {
  return useQuery({
    queryKey: ["regras-upsell"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regras_upsell")
        .select(`
          *,
          produto_origem:produtos!regras_upsell_produto_origem_id_fkey(*),
          produto_destino:produtos!regras_upsell_produto_destino_id_fkey(*)
        `)
        .order("created_at");

      if (error) throw error;
      return data as RegraUpsell[];
    },
  });
}

export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: Omit<Produto, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("produtos")
        .insert(produto)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar produto: " + error.message);
    },
  });
}

export function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...produto }: Partial<Produto> & { id: string }) => {
      const { data, error } = await supabase
        .from("produtos")
        .update(produto)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar produto: " + error.message);
    },
  });
}

export function useDeleteProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir produto: " + error.message);
    },
  });
}

export function useCreateRegraUpsell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (regra: Omit<RegraUpsell, "id" | "created_at" | "updated_at" | "produto_origem" | "produto_destino">) => {
      const { data, error } = await supabase
        .from("regras_upsell")
        .insert(regra)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras-upsell"] });
      toast.success("Regra de upsell criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar regra: " + error.message);
    },
  });
}

export function useUpdateRegraUpsell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...regra }: Partial<RegraUpsell> & { id: string }) => {
      const { data, error } = await supabase
        .from("regras_upsell")
        .update(regra)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras-upsell"] });
      toast.success("Regra de upsell atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar regra: " + error.message);
    },
  });
}

export function useDeleteRegraUpsell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("regras_upsell")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras-upsell"] });
      toast.success("Regra de upsell excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir regra: " + error.message);
    },
  });
}

export function useEstatisticasProdutos() {
  return useQuery({
    queryKey: ["estatisticas-produtos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("plano_mentoria");

      if (error) throw error;

      const stats = {
        academy: 0,
        lab: 0,
        skills: 0,
        club: 0,
        total: data.length,
      };

      data.forEach((profile) => {
        if (profile.plano_mentoria) {
          stats[profile.plano_mentoria as keyof typeof stats]++;
        }
      });

      return stats;
    },
  });
}
