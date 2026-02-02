import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSkillsMembro() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["skills-membro", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id, papel, cargo, status")
        .eq("user_id", user.id)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    equipeId: data?.equipe_id ?? null,
    papel: data?.papel as "lider" | "membro" | null,
    isLider: data?.papel === "lider",
    isMembro: data?.papel === "membro",
    cargo: data?.cargo ?? null,
    isLoading,
  };
}
