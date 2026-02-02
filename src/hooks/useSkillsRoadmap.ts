import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSkillsRoadmap() {
  const { user } = useAuth();

  // Buscar equipe do usuário
  const { data: membroData } = useQuery({
    queryKey: ["membro-equipe-skills", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id")
        .eq("user_id", user.id)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar fases do roadmap
  const { data: fases, isLoading } = useQuery({
    queryKey: ["roadmap-skills", membroData?.equipe_id],
    queryFn: async () => {
      if (!membroData?.equipe_id) return [];
      const { data, error } = await supabase
        .from("roadmap_skills")
        .select("*")
        .eq("equipe_id", membroData.equipe_id)
        .order("numero_fase", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!membroData?.equipe_id,
  });

  return {
    fases,
    isLoading,
  };
}
