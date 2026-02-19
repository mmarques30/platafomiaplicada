import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticoVersao {
  id: string;
  versao: number;
  completado: boolean;
  hasInsight: boolean;
  insight_ia: any;
  processos_analisados: any;
  economia_horas_semana: number | null;
  economia_valor_mensal: number | null;
  dadosBrutos: Record<string, any> | null;
}

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
  dadosBrutos: Record<string, any> | null;
  // Todas as versões do diagnóstico
  versoes: DiagnosticoVersao[];
}

export function useDiagnosticosEquipeAdmin(equipeId?: string | null) {
  return useQuery({
    queryKey: ["admin-diagnosticos-equipe", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];

      const { data: membros, error: membrosError } = await supabase
        .from("membros_equipe_skills")
        .select("user_id, papel, cargo")
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");

      if (membrosError) throw membrosError;
      if (!membros?.length) return [];

      const userIds = membros.map(m => m.user_id);

      const [profilesRes, diagRes] = await Promise.all([
        supabase.from("profiles").select("id, nome_completo, avatar_url").in("id", userIds),
        supabase.from("diagnosticos_skills").select("*").in("user_id", userIds).eq("equipe_id", equipeId).order("versao", { ascending: true }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (diagRes.error) throw diagRes.error;

      const profilesMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);

      // Agrupar diagnósticos por user_id
      const diagsByUser = new Map<string, any[]>();
      for (const d of (diagRes.data || [])) {
        const list = diagsByUser.get(d.user_id) || [];
        list.push(d);
        diagsByUser.set(d.user_id, list);
      }

      return membros.map(m => {
        const profile = profilesMap.get(m.user_id);
        const userDiags = diagsByUser.get(m.user_id) || [];
        
        // Versão mais recente para campos de compatibilidade
        const latestDiag = userDiags.length > 0 ? userDiags[userDiags.length - 1] : null;

        const versoes: DiagnosticoVersao[] = userDiags.map(d => ({
          id: d.id,
          versao: d.versao || 1,
          completado: d.completado === true,
          hasInsight: !!d.insight_ia,
          insight_ia: d.insight_ia || null,
          processos_analisados: d.processos_analisados || null,
          economia_horas_semana: d.economia_horas_semana || null,
          economia_valor_mensal: d.economia_valor_mensal || null,
          dadosBrutos: d,
        }));

        return {
          userId: m.user_id,
          nome: profile?.nome_completo || "Sem nome",
          avatar: profile?.avatar_url || null,
          cargo: m.cargo,
          completado: latestDiag?.completado === true,
          hasInsight: !!latestDiag?.insight_ia,
          diagnosticoId: latestDiag?.id || null,
          insight_ia: latestDiag?.insight_ia || null,
          processos_analisados: latestDiag?.processos_analisados || null,
          economia_horas_semana: latestDiag?.economia_horas_semana || null,
          economia_valor_mensal: latestDiag?.economia_valor_mensal || null,
          dadosBrutos: latestDiag ? latestDiag : null,
          versoes,
        } as MembroDiagnostico;
      });
    },
    enabled: !!equipeId,
  });
}
