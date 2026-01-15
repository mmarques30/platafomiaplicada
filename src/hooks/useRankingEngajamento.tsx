import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankingEngajamentoItem {
  user_id: string;
  nome_completo: string;
  avatar_url: string;
  total_pontos: number;
  posicao: number;
  total_posts: number;
  total_comentarios: number;
  total_likes_dados: number;
  total_likes_recebidos: number;
  dias_ativos_30d: number;
}

export function useRankingEngajamento() {
  return useQuery({
    queryKey: ["ranking-engajamento"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_ranking_engajamento");
        
        if (error) {
          console.warn("Erro ao buscar ranking de engajamento:", error);
          return [];
        }
        
        return (data as RankingEngajamentoItem[]) || [];
      } catch (error) {
        console.warn("Erro inesperado no ranking:", error);
        return [];
      }
    },
    refetchInterval: 60000,
    retry: 1,
    staleTime: 30000,
  });
}
