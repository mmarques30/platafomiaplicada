import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUsersAuthProviders() {
  return useQuery({
    queryKey: ['users-auth-providers'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-users-auth-providers');
      
      if (error) {
        console.error('Erro ao buscar providers:', error);
        throw error;
      }
      
      return data.providers as Record<string, string>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
