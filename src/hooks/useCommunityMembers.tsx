import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityMember {
  id: string;
  nome_completo: string;
  avatar_url: string | null;
  bio: string | null;
  nivel_comunidade: number;
  pontos_comunidade: number;
  ultimo_acesso: string | null;
  created_at: string | null;
  is_admin?: boolean;
}

export function useCommunityMembers(filter?: "all" | "admin" | "online") {
  const { data: members, isLoading } = useQuery({
    queryKey: ["community-members", filter],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("conta_ativa", true)
        .order("pontos_comunidade", { ascending: false });

      const { data: profiles, error } = await query;
      if (error) throw error;

      // Get admin roles
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminIds = new Set(adminRoles?.map((r) => r.user_id) || []);

      let filteredMembers = profiles.map((profile) => ({
        ...profile,
        is_admin: adminIds.has(profile.id),
      }));

      // Apply filters
      if (filter === "admin") {
        filteredMembers = filteredMembers.filter((m) => m.is_admin);
      } else if (filter === "online") {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        filteredMembers = filteredMembers.filter(
          (m) => m.ultimo_acesso && m.ultimo_acesso > fiveMinutesAgo
        );
      }

      return filteredMembers as CommunityMember[];
    },
  });

  return {
    members: members || [],
    isLoading,
  };
}
