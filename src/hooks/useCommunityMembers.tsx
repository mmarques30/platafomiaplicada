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
  plano_mentoria: string | null;
  is_admin?: boolean;
}

export function useCommunityMembers(filter?: "all" | "facilitador" | "online") {
  const { data: members, isLoading } = useQuery({
    queryKey: ["community-members", filter],
    queryFn: async () => {
      // Usa função RPC segura que retorna apenas dados públicos
      const { data: profiles, error } = await supabase
        .rpc('get_public_profiles');
      
      if (error) throw error;

      // Get admin roles
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      // Get facilitador roles
      const { data: facilitadorRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "facilitador");

      const adminIds = new Set(adminRoles?.map((r) => r.user_id) || []);
      const facilitadorIds = new Set(facilitadorRoles?.map((r) => r.user_id) || []);

      let filteredMembers = (profiles || []).map((profile: any) => ({
        ...profile,
        is_admin: adminIds.has(profile.id),
        is_facilitador: facilitadorIds.has(profile.id),
      }));

      // Apply filters
      if (filter === "facilitador") {
        filteredMembers = filteredMembers.filter((m) => m.is_facilitador);
      } else if (filter === "online") {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        filteredMembers = filteredMembers.filter(
          (m) => m.ultimo_acesso && m.ultimo_acesso > fiveMinutesAgo
        );
      }

      // Sort by pontos_comunidade descending
      filteredMembers.sort((a, b) => (b.pontos_comunidade || 0) - (a.pontos_comunidade || 0));

      return filteredMembers as CommunityMember[];
    },
  });

  return {
    members: members || [],
    isLoading,
  };
}
