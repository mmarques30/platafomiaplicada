import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRankingComunidade = () => {
  return useQuery({
    queryKey: ["ranking-comunidade"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_ranking_comunidade' as any)
        .limit(50) as any;
      
      if (error) {
        console.error("Erro ao buscar ranking:", error);
        return [];
      }
      return data || [];
    }
  });
};
