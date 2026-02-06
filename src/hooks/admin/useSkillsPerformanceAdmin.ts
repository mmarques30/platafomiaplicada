import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Entregas CRUD ────────────────────────────────────────────────────────

export function useEntregasSkillsAdmin(equipeId: string | null) {
  return useQuery({
    queryKey: ["admin-entregas-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("entregas_skills")
        .select("*, responsavel:profiles!entregas_skills_responsavel_id_fkey(id, nome_completo)")
        .eq("equipe_id", equipeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!equipeId,
  });
}

export function useUpsertEntregaSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      id?: string;
      equipe_id: string;
      titulo: string;
      descricao?: string;
      responsavel_id?: string | null;
      economia_horas_semana?: number;
      roi?: number;
      avaliacao_nota?: number;
      prazo?: string | null;
      status?: string;
    }) => {
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from("entregas_skills").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("entregas_skills").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-entregas-skills"] });
      toast.success("Entrega salva com sucesso!");
    },
    onError: (e) => toast.error("Erro ao salvar entrega: " + e.message),
  });
}

export function useDeleteEntregaSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entregas_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-entregas-skills"] });
      toast.success("Entrega excluída!");
    },
    onError: (e) => toast.error("Erro ao excluir: " + e.message),
  });
}

// ── Métricas CRUD ────────────────────────────────────────────────────────

export function useMetricasSkillsAdmin(equipeId: string | null) {
  return useQuery({
    queryKey: ["admin-metricas-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("metricas_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("semana");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!equipeId,
  });
}

export function useUpsertMetricaSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      id?: string;
      equipe_id: string;
      semana: number;
      horas_economizadas?: number;
      processos_automatizados?: number;
      entregas_concluidas?: number;
      entregas_planejadas?: number;
      indice_maturidade?: number;
      roi_projetado?: number;
      roi_executado?: number;
      engajamento_trilhas?: number;
    }) => {
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from("metricas_skills").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("metricas_skills").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-metricas-skills"] });
      toast.success("Métrica salva com sucesso!");
    },
    onError: (e) => toast.error("Erro ao salvar métrica: " + e.message),
  });
}

// ── Roadmap CRUD ─────────────────────────────────────────────────────────

export function useRoadmapSkillsAdmin(equipeId: string | null) {
  return useQuery({
    queryKey: ["admin-roadmap-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("roadmap_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("numero_fase");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!equipeId,
  });
}

export function useUpsertRoadmapSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      id?: string;
      equipe_id: string;
      numero_fase: number;
      titulo: string;
      descricao?: string;
      semana_inicio?: number;
      semana_fim?: number;
      status?: string;
    }) => {
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from("roadmap_skills").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("roadmap_skills").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roadmap-skills"] });
      toast.success("Fase salva com sucesso!");
    },
    onError: (e) => toast.error("Erro ao salvar fase: " + e.message),
  });
}

export function useDeleteRoadmapSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("roadmap_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-roadmap-skills"] });
      toast.success("Fase excluída!");
    },
    onError: (e) => toast.error("Erro ao excluir: " + e.message),
  });
}

// ── Equipe Update ────────────────────────────────────────────────────────

export function useUpdateEquipeSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      id: string;
      semana_atual?: number;
      investimento?: number;
      custo_hora_padrao?: number;
      data_inicio?: string | null;
      data_fim?: string | null;
    }) => {
      const { id, ...rest } = values;
      const { error } = await supabase.from("equipes_skills").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-equipes-skills"] });
      toast.success("Equipe atualizada!");
    },
    onError: (e) => toast.error("Erro ao atualizar equipe: " + e.message),
  });
}

// ── Membros da equipe (para select de responsável) ───────────────────────

export function useMembrosEquipeSkills(equipeId: string | null) {
  return useQuery({
    queryKey: ["admin-membros-equipe-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("user_id, papel, cargo, profiles:profiles!membros_equipe_skills_user_id_fkey(id, nome_completo)")
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!equipeId,
  });
}

// ── Equipe detail (single) ───────────────────────────────────────────────

export function useEquipeSkillsDetail(equipeId: string | null) {
  return useQuery({
    queryKey: ["admin-equipe-skills-detail", equipeId],
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
}
