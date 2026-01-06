import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCommunityStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      // Total members
      const { count: totalMembers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("conta_ativa", true);

      // Online members (active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: onlineMembers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("conta_ativa", true)
        .gt("ultimo_acesso", fiveMinutesAgo);

      // Facilitadores
      const { count: facilitadorCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "facilitador");

      return {
        totalMembers: totalMembers || 0,
        onlineMembers: onlineMembers || 0,
        facilitadorCount: facilitadorCount || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    stats: stats || { totalMembers: 0, onlineMembers: 0, facilitadorCount: 0 },
    isLoading,
  };
}
