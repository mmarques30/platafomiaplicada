import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsMembro } from "./useSkillsMembro";

export function useSkillsBacklog() {
  const { equipeId } = useSkillsMembro();

  // Buscar itens do backlog
  const { data: items, isLoading } = useQuery({
    queryKey: ["backlog-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      
      // Buscar backlog
      const { data: backlogData, error } = await supabase
        .from("backlog_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("ordem", { ascending: true });
      if (error) throw error;
      
      // Buscar responsáveis
      const responsavelIds = backlogData?.map(b => b.responsavel_id).filter(Boolean) || [];
      let responsaveis: Record<string, any> = {};
      
      if (responsavelIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, nome, avatar_url")
          .in("id", responsavelIds as string[]);
        
        if (profilesData) {
          responsaveis = profilesData.reduce((acc: Record<string, any>, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }
      
      // Combinar dados
      return backlogData?.map(item => ({
        ...item,
        responsavel: item.responsavel_id ? responsaveis[item.responsavel_id] : null,
      })) || [];
    },
    enabled: !!equipeId,
  });

  return {
    items,
    isLoading,
  };
}
