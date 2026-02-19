import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GratuitoStats {
  total_visitantes: number;
  online_visitantes: number;
  total_conteudos_gratuitos: number;
  total_materiais_gratuitos: number;
  total_videos_assistidos: number;
  total_materiais_baixados: number;
}

export function useCommunityStatsGratuito() {
  return useQuery({
    queryKey: ["community-stats-gratuito"],
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_gratuito_stats');
      
      if (error) throw error;
      
      // A função retorna um array, pegamos o primeiro item
      const stats = Array.isArray(data) ? data[0] : data;
      
      return {
        total_visitantes: Number(stats?.total_visitantes ?? 0),
        online_visitantes: Number(stats?.online_visitantes ?? 0),
        total_conteudos_gratuitos: Number(stats?.total_conteudos_gratuitos ?? 0),
        total_materiais_gratuitos: Number(stats?.total_materiais_gratuitos ?? 0),
        total_videos_assistidos: Number(stats?.total_videos_assistidos ?? 0),
        total_materiais_baixados: Number(stats?.total_materiais_baixados ?? 0),
      } as GratuitoStats;
    },
  });
}
