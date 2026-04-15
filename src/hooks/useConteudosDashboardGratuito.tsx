import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TipoConteudo, ConteudoDashboard } from "./useConteudosDashboard";

export function useConteudosDashboardGratuito(tipo?: TipoConteudo) {
  return useQuery({
    queryKey: ['conteudos-dashboard-gratuito', tipo],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('conteudos_dashboard')
        .select('*')
        .eq('ativo', true)
        .eq('visivel_gratuitos', true)
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ConteudoDashboard[];
    },
  });
}
