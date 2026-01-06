import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Player {
  id: string;
  user_id: string;
  codigo_indicacao: string;
  total_indicacoes: number;
  comissao_acumulada: number;
  data_player: string;
  whatsapp: string | null;
  especialidade: string | null;
  apresentacao: string | null;
  ativo: boolean;
  // From profiles join
  nome_completo: string;
  avatar_url: string | null;
  linkedin: string | null;
  nivel_comunidade: number;
}

export function usePlayers() {
  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("ativo", true)
        .order("total_indicacoes", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each player
      const userIds = data?.map((p) => p.user_id) || [];
      
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome_completo, avatar_url, linkedin, nivel_comunidade")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return data.map((player) => {
        const profile = profilesMap.get(player.user_id);
        return {
          ...player,
          nome_completo: profile?.nome_completo || "Player",
          avatar_url: profile?.avatar_url || null,
          linkedin: profile?.linkedin || null,
          nivel_comunidade: profile?.nivel_comunidade || 1,
        };
      }) as Player[];
    },
  });

  return {
    players: players || [],
    isLoading,
  };
}
