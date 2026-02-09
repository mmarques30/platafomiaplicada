import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsMembro } from "./useSkillsMembro";
import { useAuth } from "./useAuth";

interface MembroDiagnostico {
  userId: string;
  nome: string;
  avatar: string | null;
  completado: boolean;
  hasInsight: boolean;
}

export function useSkillsEquipeDiagnostico() {
  const { user } = useAuth();
  const { equipeId, isLoading: membroLoading } = useSkillsMembro();

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ["skills-equipe-diagnostico", equipeId],
    queryFn: async () => {
      if (!equipeId) return null;

      // Buscar membros ativos da equipe com perfil
      const { data: membrosData, error: membrosError } = await supabase
        .from("membros_equipe_skills")
        .select(`
          user_id,
          profiles!inner (
            nome_completo,
            avatar_url
          )
        `)
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");
      if (membrosError) throw membrosError;

      // Buscar diagnósticos da equipe
      const { data: diagnosticosData, error: diagError } = await supabase
        .from("diagnosticos_skills")
        .select("user_id, completado, insight_ia")
        .eq("equipe_id", equipeId);
      if (diagError) throw diagError;

      const membros: MembroDiagnostico[] = (membrosData || []).map((m: any) => {
        const diag = diagnosticosData?.find((d) => d.user_id === m.user_id);
        return {
          userId: m.user_id,
          nome: m.profiles?.nome_completo || "Usuário",
          avatar: m.profiles?.avatar_url || null,
          completado: diag?.completado || false,
          hasInsight: !!diag?.insight_ia,
        };
      });

      return membros;
    },
    enabled: !!equipeId,
  });

  const membros = data || [];
  const totalMembros = membros.length;
  const diagnosticosCompletos = membros.filter((m) => m.completado).length;
  const todosPreencheram = totalMembros > 0 && diagnosticosCompletos === totalMembros;
  const meuDiagnosticoCompleto = membros.find((m) => m.userId === user?.id)?.completado || false;

  return {
    membros,
    totalMembros,
    diagnosticosCompletos,
    todosPreencheram,
    meuDiagnosticoCompleto,
    isLoading: membroLoading || queryLoading,
  };
}
