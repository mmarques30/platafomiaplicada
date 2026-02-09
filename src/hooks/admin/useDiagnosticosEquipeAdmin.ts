import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MembroDiagnostico {
  userId: string;
  nome: string;
  avatar: string | null;
  cargo: string | null;
  completado: boolean;
  hasInsight: boolean;
  diagnosticoId: string | null;
  insight_ia: any;
  processos_analisados: any;
  economia_horas_semana: number | null;
  economia_valor_mensal: number | null;
  // Campos brutos do diagnóstico
  dadosBrutos: Record<string, any> | null;
}

export function useDiagnosticosEquipeAdmin(equipeId?: string | null) {
  return useQuery({
    queryKey: ["admin-diagnosticos-equipe", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];

      // Get team members
      const { data: membros, error: membrosError } = await supabase
        .from("membros_equipe_skills")
        .select("user_id, papel, cargo")
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");

      if (membrosError) throw membrosError;
      if (!membros?.length) return [];

      const userIds = membros.map(m => m.user_id);

      // Get profiles and diagnostics in parallel
      const [profilesRes, diagRes] = await Promise.all([
        supabase.from("profiles").select("id, nome_completo, avatar_url").in("id", userIds),
        supabase.from("diagnosticos_skills").select("*").in("user_id", userIds).eq("equipe_id", equipeId),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (diagRes.error) throw diagRes.error;

      const profilesMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      const diagMap = new Map(diagRes.data?.map(d => [d.user_id, d]) || []);

      return membros.map(m => {
        const profile = profilesMap.get(m.user_id);
        const diag = diagMap.get(m.user_id);
        return {
          userId: m.user_id,
          nome: profile?.nome_completo || "Sem nome",
          avatar: profile?.avatar_url || null,
          cargo: m.cargo,
          completado: diag?.completado === true,
          hasInsight: !!diag?.insight_ia,
          diagnosticoId: diag?.id || null,
          insight_ia: diag?.insight_ia || null,
          processos_analisados: diag?.processos_analisados || null,
          economia_horas_semana: diag?.economia_horas_semana || null,
          economia_valor_mensal: diag?.economia_valor_mensal || null,
          dadosBrutos: diag ? diag : null,
        } as MembroDiagnostico;
      });
    },
    enabled: !!equipeId,
  });
}
