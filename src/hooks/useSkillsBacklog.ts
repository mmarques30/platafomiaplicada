import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSkillsBacklog() {
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

  // Buscar itens do backlog
  const { data: items, isLoading } = useQuery({
    queryKey: ["backlog-skills", membroData?.equipe_id],
    queryFn: async () => {
      if (!membroData?.equipe_id) return [];
      
      // Buscar backlog
      const { data: backlogData, error } = await supabase
        .from("backlog_skills")
        .select("*")
        .eq("equipe_id", membroData.equipe_id)
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
    enabled: !!membroData?.equipe_id,
  });

  return {
    items,
    isLoading,
  };
}
