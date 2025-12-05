import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Pesquisa, RespostaPesquisa, Secao } from "@/types/pesquisas";

export function usePesquisa(slug: string) {
  return useQuery({
    queryKey: ["pesquisa", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pesquisas")
        .select("*")
        .eq("slug", slug)
        .eq("ativo", true)
        .single();

      if (error) throw error;
      return {
        ...data,
        perguntas: data.perguntas as unknown as Secao[]
      } as Pesquisa;
    },
    enabled: !!slug,
  });
}

export function useMinhaResposta(pesquisaId: string) {
  return useQuery({
    queryKey: ["minha-resposta", pesquisaId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("respostas_pesquisas")
        .select("*")
        .eq("pesquisa_id", pesquisaId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as RespostaPesquisa | null;
    },
    enabled: !!pesquisaId,
  });
}

export function useSalvarResposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pesquisaId,
      respostas,
      secaoAtual,
      completado,
      tempoResposta,
    }: {
      pesquisaId: string;
      respostas: Record<string, string>;
      secaoAtual: number;
      completado: boolean;
      tempoResposta?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("respostas_pesquisas")
        .upsert({
          pesquisa_id: pesquisaId,
          user_id: user.id,
          respostas,
          secao_atual: secaoAtual,
          completado,
          tempo_resposta: tempoResposta,
        }, {
          onConflict: "pesquisa_id,user_id",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["minha-resposta", variables.pesquisaId] });
    },
  });
}

// Admin hooks
export function usePesquisasAdmin() {
  return useQuery({
    queryKey: ["pesquisas-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pesquisas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(p => ({
        ...p,
        perguntas: p.perguntas as unknown as Secao[]
      })) as Pesquisa[];
    },
  });
}

export function useRespostasPesquisa(pesquisaId: string) {
  return useQuery({
    queryKey: ["respostas-pesquisa", pesquisaId],
    queryFn: async () => {
      // Buscar respostas sem JOIN para incluir respostas de visitantes (user_id = null)
      const { data, error } = await supabase
        .from("respostas_pesquisas")
        .select("*")
        .eq("pesquisa_id", pesquisaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!pesquisaId,
  });
}

export function useDeleteResposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (respostaId: string) => {
      const { error } = await supabase
        .from("respostas_pesquisas")
        .delete()
        .eq("id", respostaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["respostas-pesquisa"] });
      queryClient.invalidateQueries({ queryKey: ["estatisticas-pesquisa"] });
    },
  });
}

export function useEstatisticasPesquisa(pesquisaId: string) {
  return useQuery({
    queryKey: ["estatisticas-pesquisa", pesquisaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("respostas_pesquisas")
        .select("completado, secao_atual")
        .eq("pesquisa_id", pesquisaId);

      if (error) throw error;

      const total = data.length;
      const completas = data.filter(r => r.completado).length;
      const parciais = data.filter(r => !r.completado).length;

      return { total, completas, parciais };
    },
    enabled: !!pesquisaId,
  });
}
