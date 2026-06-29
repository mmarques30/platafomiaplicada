import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook para IAs Copie e Use
export function useIACopieUse() {
  return useQuery({
    queryKey: ["ia-copie-use"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ia_copie_use")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Função para calcular o score combinado de ranking (escala 0–5).
//
// Critérios (definidos com a mentora):
//   - Relevância de mercado .......... peso 30%
//   - Atualidade dos modelos ......... peso 20%  ("últimos modelos")
//   - Avaliação da mentora ........... peso 30%
//   - Avaliação da comunidade ........ peso 20%  (ponderada pela confiança = nº de votos)
//
// Os pesos são normalizados apenas entre os critérios que possuem valor,
// para que o ranking degrade de forma elegante enquanto a mentora ainda não
// preencheu relevância de mercado / atualidade dos modelos de cada ferramenta.
function calcularScoreRanking(ferramenta: {
  avaliacao?: number | null;
  avaliacao_mari?: number | null;
  avaliacao_comunidade?: number | null;
  total_avaliacoes_comunidade?: number | null;
  relevancia_mercado?: number | null;
  recencia_modelo?: number | null;
}): number {
  const relevanciaMercado = ferramenta.relevancia_mercado || 0;
  const recenciaModelo = ferramenta.recencia_modelo || 0;
  const avaliacaoMentora = ferramenta.avaliacao_mari ?? ferramenta.avaliacao ?? 0;
  const avaliacaoComunidade = ferramenta.avaliacao_comunidade || 0;
  const totalAvaliacoes = ferramenta.total_avaliacoes_comunidade || 0;

  // Confiança da comunidade: mais votos = mais peso (saturando em 5 votos).
  const confiancaComunidade = Math.min(1, totalAvaliacoes / 5);

  const fatores = [
    { valor: relevanciaMercado, peso: 0.3 },
    { valor: recenciaModelo, peso: 0.2 },
    { valor: avaliacaoMentora, peso: 0.3 },
    { valor: avaliacaoComunidade, peso: 0.2 * confiancaComunidade },
  ].filter((f) => f.valor > 0 && f.peso > 0);

  if (fatores.length === 0) return 0;

  const somaPesos = fatores.reduce((acc, f) => acc + f.peso, 0);
  return fatores.reduce((acc, f) => acc + f.valor * f.peso, 0) / somaPesos;
}

// Hook para Ferramentas de IA com ranking dinâmico
export function useFerramentasIA() {
  return useQuery({
    queryKey: ["ferramentas-ia"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ferramentas_ia")
        .select("*")
        .eq("ativo", true)
        .order("avaliacao", { ascending: false });

      if (error) throw error;
      
      // Calcular score combinado para ranking e ordenar
      return data?.map(f => ({
        ...f,
        score_ranking: calcularScoreRanking(f)
      })).sort((a, b) => b.score_ranking - a.score_ranking) || [];
    },
  });
}

// Hook para Biblioteca de Prompts
export function usePrompts() {
  return useQuery({
    queryKey: ["biblioteca-prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("biblioteca_prompts")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para Métodos para Aplicar
export function useMetodos() {
  return useQuery({
    queryKey: ["metodos-aplicar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metodos_aplicar")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para Materiais Gratuitos
export function useMateriaisGratuitos() {
  return useQuery({
    queryKey: ["materiais-gratuitos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_gratuitos")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para criar favorito
export function useAddFavorito() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ itemId, tipo }: { itemId: string; tipo: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("favoritos")
        .insert({ user_id: user.id, item_id: itemId, tipo });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      toast({
        title: "Adicionado aos favoritos!",
        description: "Item salvo com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar aos favoritos",
        variant: "destructive",
      });
    },
  });
}
