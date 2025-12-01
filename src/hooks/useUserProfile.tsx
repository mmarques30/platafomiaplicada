import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  id: string;
  nome_completo: string;
  email: string | null;
  avatar_url: string | null;
  plano_mentoria: "academy" | "lab" | "skills" | "club" | "legacy" | "boost" | null;
  data_expiracao_acesso: string | null;
  created_at: string | null;
  conta_ativa: boolean | null;
  senha_temporaria: boolean | null;
  primeiro_acesso: boolean | null;
}

export function useUserProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const diasRestantes = profile?.data_expiracao_acesso
    ? Math.ceil(
        (new Date(profile.data_expiracao_acesso).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const planoExpirado = diasRestantes !== null && diasRestantes < 0;
  const planoVitalicio = profile?.data_expiracao_acesso === null;

  return {
    profile,
    isLoading,
    diasRestantes,
    planoExpirado,
    planoVitalicio,
  };
}
