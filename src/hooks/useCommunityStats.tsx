import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_STATS = { totalMembers: 0, onlineMembers: 0, facilitadorCount: 0 };

export function useCommunityStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      try {
        // Total members
        const { count: totalMembers, error: totalError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("conta_ativa", true);

        if (totalError) {
          console.warn("Erro ao buscar total de membros:", totalError);
        }

        // Online members (active in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { count: onlineMembers, error: onlineError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("conta_ativa", true)
          .gt("ultimo_acesso", fiveMinutesAgo);

        if (onlineError) {
          console.warn("Erro ao buscar membros online:", onlineError);
        }

        // Facilitadores
        const { count: facilitadorCount, error: facilitadorError } = await supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "facilitador");

        if (facilitadorError) {
          console.warn("Erro ao buscar facilitadores:", facilitadorError);
        }

        return {
          totalMembers: totalMembers || 0,
          onlineMembers: onlineMembers || 0,
          facilitadorCount: facilitadorCount || 0,
        };
      } catch (error) {
        console.warn("Erro ao buscar stats da comunidade:", error);
        return DEFAULT_STATS;
      }
    },
    refetchInterval: 30000,
    retry: 1,
    staleTime: 10000,
  });

  return {
    stats: stats || DEFAULT_STATS,
    isLoading,
    error,
  };
}
