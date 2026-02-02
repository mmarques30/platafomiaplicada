import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useSkillsEquipe() {
  const { user } = useAuth();

  // Buscar equipe do usuário
  const { data: membroData, isLoading: membroLoading } = useQuery({
    queryKey: ["membro-equipe-skills", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id, papel")
        .eq("user_id", user.id)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados da equipe
  const { data: equipe, isLoading: equipeLoading } = useQuery({
    queryKey: ["equipe-skills", membroData?.equipe_id],
    queryFn: async () => {
      if (!membroData?.equipe_id) return null;
      const { data, error } = await supabase
        .from("equipes_skills")
        .select("*")
        .eq("id", membroData.equipe_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!membroData?.equipe_id,
  });

  // Buscar membros da equipe com status do diagnóstico
  const { data: membros, isLoading: membrosLoading } = useQuery({
    queryKey: ["membros-equipe-skills", membroData?.equipe_id],
    queryFn: async () => {
      if (!membroData?.equipe_id) return [];
      
      // Buscar membros
      const { data: membrosData, error: membrosError } = await supabase
        .from("membros_equipe_skills")
        .select(`
          id,
          cargo,
          papel,
          user_id,
          profiles:user_id (
            id,
            nome,
            avatar_url
          )
        `)
        .eq("equipe_id", membroData.equipe_id)
        .eq("status", "ativo");
      
      if (membrosError) throw membrosError;
      
      // Buscar diagnósticos para verificar quem completou
      const { data: diagnosticosData, error: diagError } = await supabase
        .from("diagnosticos_skills")
        .select("user_id, completado")
        .eq("equipe_id", membroData.equipe_id);
      
      if (diagError) throw diagError;
      
      // Mapear membros com status do diagnóstico
      return membrosData?.map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        cargo: m.cargo,
        papel: m.papel,
        nome: m.profiles?.nome || "Usuário",
        avatar_url: m.profiles?.avatar_url,
        diagnostico_completo: diagnosticosData?.find(d => d.user_id === m.user_id)?.completado || false,
      })) || [];
    },
    enabled: !!membroData?.equipe_id,
  });

  // Buscar diagnóstico consolidado
  const { data: consolidado, isLoading: consolidadoLoading } = useQuery({
    queryKey: ["consolidado-skills", membroData?.equipe_id],
    queryFn: async () => {
      if (!membroData?.equipe_id) return null;
      const { data, error } = await supabase
        .from("diagnostico_consolidado_skills")
        .select("*")
        .eq("equipe_id", membroData.equipe_id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!membroData?.equipe_id,
  });

  return {
    equipe,
    membros,
    consolidado,
    isLider: membroData?.papel === "lider",
    isLoading: membroLoading || equipeLoading || membrosLoading || consolidadoLoading,
  };
}
