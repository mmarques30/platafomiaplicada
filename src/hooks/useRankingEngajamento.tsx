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
      const { data, error } = await supabase.rpc("get_ranking_engajamento");
      
      if (error) {
        console.error("Erro ao buscar ranking de engajamento:", error);
        throw error;
      }
      
      return data as RankingEngajamentoItem[];
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}
