import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSkillsEntregas() {
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

  // Buscar entregas do usuário
  const { data: entregas, isLoading } = useQuery({
    queryKey: ["entregas-skills", user?.id, membroData?.equipe_id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from("entregas_skills")
        .select("*")
        .eq("responsavel_id", user.id)
        .order("prazo", { ascending: true, nullsFirst: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return {
    entregas,
    isLoading,
  };
}
