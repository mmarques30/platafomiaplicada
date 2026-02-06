import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsMembro } from "./useSkillsMembro";

export function useSkillsEquipe() {
  const { equipeId, papel, isLoading: membroLoading } = useSkillsMembro();

  // Buscar dados da equipe
  const { data: equipe, isLoading: equipeLoading } = useQuery({
    queryKey: ["equipe-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return null;
      const { data, error } = await supabase
        .from("equipes_skills")
        .select("*")
        .eq("id", equipeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!equipeId,
  });

  // Buscar membros da equipe com status do diagnóstico
  const { data: membros, isLoading: membrosLoading } = useQuery({
    queryKey: ["membros-equipe-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      
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
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");
      
      if (membrosError) throw membrosError;
      
      // Buscar diagnósticos para verificar quem completou
      const { data: diagnosticosData, error: diagError } = await supabase
        .from("diagnosticos_skills")
        .select("user_id, completado")
        .eq("equipe_id", equipeId);
      
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
    enabled: !!equipeId,
  });

  // Buscar diagnóstico consolidado
  const { data: consolidado, isLoading: consolidadoLoading } = useQuery({
    queryKey: ["consolidado-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return null;
      const { data, error } = await supabase
        .from("diagnostico_consolidado_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!equipeId,
  });

  return {
    equipe,
    membros,
    consolidado,
    isLider: papel === "lider",
    isLoading: membroLoading || equipeLoading || membrosLoading || consolidadoLoading,
  };
}
