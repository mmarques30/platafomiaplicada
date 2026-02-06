import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsMembro } from "./useSkillsMembro";

export function useSkillsRoadmap() {
  const { equipeId } = useSkillsMembro();

  // Buscar fases do roadmap
  const { data: fases, isLoading } = useQuery({
    queryKey: ["roadmap-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("roadmap_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("numero_fase", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!equipeId,
  });

  return {
    fases,
    isLoading,
  };
}
