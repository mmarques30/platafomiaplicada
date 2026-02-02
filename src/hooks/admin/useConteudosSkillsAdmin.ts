import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface ConteudoLiberadoAdmin {
  id: string;
  equipe_id: string;
  trilha_id: string | null;
  modulo_id: string | null;
  liberado_por: string | null;
  motivo: string | null;
  fase_roadmap_id: string | null;
  ordem: number;
  created_at: string;
  trilha?: {
    id: string;
    titulo: string;
  };
  modulo?: {
    id: string;
    titulo: string;
    trilha_id: string;
  };
}

export function useConteudosLiberadosAdmin(equipeId: string | null) {
  return useQuery({
    queryKey: ["admin-conteudos-liberados", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];

      const { data, error } = await supabase
        .from("conteudos_liberados_skills")
        .select(`
          id,
          equipe_id,
          trilha_id,
          modulo_id,
          liberado_por,
          motivo,
          fase_roadmap_id,
          ordem,
          created_at
        `)
        .eq("equipe_id", equipeId)
        .order("ordem", { ascending: true });

      if (error) throw error;

      // Buscar detalhes das trilhas e módulos
      const trilhaIds = data.filter(c => c.trilha_id).map(c => c.trilha_id);
      const moduloIds = data.filter(c => c.modulo_id).map(c => c.modulo_id);

      const [trilhasRes, modulosRes] = await Promise.all([
        trilhaIds.length > 0
          ? supabase.from("trilhas").select("id, titulo").in("id", trilhaIds)
          : { data: [] },
        moduloIds.length > 0
          ? supabase.from("modulos").select("id, titulo, trilha_id").in("id", moduloIds)
          : { data: [] },
      ]);

      const trilhasMap = new Map((trilhasRes.data || []).map(t => [t.id, t]));
      const modulosMap = new Map((modulosRes.data || []).map(m => [m.id, m]));

      return data.map(conteudo => ({
        ...conteudo,
        trilha: conteudo.trilha_id ? trilhasMap.get(conteudo.trilha_id) : undefined,
        modulo: conteudo.modulo_id ? modulosMap.get(conteudo.modulo_id) : undefined,
      })) as ConteudoLiberadoAdmin[];
    },
    enabled: !!equipeId,
  });
}

export function useAddConteudoLiberado() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      equipeId,
      trilhaId,
      moduloId,
      motivo,
      faseRoadmapId,
    }: {
      equipeId: string;
      trilhaId?: string | null;
      moduloId?: string | null;
      motivo?: string;
      faseRoadmapId?: string | null;
    }) => {
      // Buscar maior ordem atual
      const { data: existing } = await supabase
        .from("conteudos_liberados_skills")
        .select("ordem")
        .eq("equipe_id", equipeId)
        .order("ordem", { ascending: false })
        .limit(1);

      const nextOrdem = (existing?.[0]?.ordem || 0) + 1;

      const { data, error } = await supabase
        .from("conteudos_liberados_skills")
        .insert({
          equipe_id: equipeId,
          trilha_id: trilhaId || null,
          modulo_id: moduloId || null,
          liberado_por: user?.id,
          motivo: motivo || "manual",
          fase_roadmap_id: faseRoadmapId || null,
          ordem: nextOrdem,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-conteudos-liberados", variables.equipeId] });
      toast.success("Conteúdo liberado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao liberar conteúdo: " + error.message);
    },
  });
}

export function useRemoveConteudoLiberado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, equipeId }: { id: string; equipeId: string }) => {
      const { error } = await supabase
        .from("conteudos_liberados_skills")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { equipeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-conteudos-liberados", result.equipeId] });
      toast.success("Conteúdo removido!");
    },
    onError: (error) => {
      toast.error("Erro ao remover conteúdo: " + error.message);
    },
  });
}

export function useUpdateConteudoOrdem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, equipeId }: { items: { id: string; ordem: number }[]; equipeId: string }) => {
      for (const item of items) {
        const { error } = await supabase
          .from("conteudos_liberados_skills")
          .update({ ordem: item.ordem })
          .eq("id", item.id);

        if (error) throw error;
      }
      return { equipeId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-conteudos-liberados", result.equipeId] });
    },
    onError: (error) => {
      toast.error("Erro ao reordenar: " + error.message);
    },
  });
}

// Hook para buscar todas as trilhas disponíveis
export function useTrilhasDisponiveis() {
  return useQuery({
    queryKey: ["trilhas-disponiveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("id, titulo")
        .eq("ativo", true)
        .order("titulo");

      if (error) throw error;
      return data;
    },
  });
}

// Hook para buscar módulos de uma trilha
export function useModulosByTrilha(trilhaId: string | null) {
  return useQuery({
    queryKey: ["modulos-by-trilha", trilhaId],
    queryFn: async () => {
      if (!trilhaId) return [];

      const { data, error } = await supabase
        .from("modulos")
        .select("id, titulo")
        .eq("trilha_id", trilhaId)
        .eq("ativo", true)
        .order("ordem");

      if (error) throw error;
      return data;
    },
    enabled: !!trilhaId,
  });
}

// Hook para buscar diagnósticos da equipe
export function useDiagnosticosEquipe(equipeId: string | null) {
  return useQuery({
    queryKey: ["diagnosticos-equipe", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];

      const { data, error } = await supabase
        .from("diagnosticos_skills")
        .select(`
          id,
          user_id,
          cargo,
          area_atuacao,
          tarefas_manuais,
          gargalos_identificados,
          completado,
          created_at
        `)
        .eq("equipe_id", equipeId);

      if (error) throw error;

      // Buscar nomes dos usuários
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome_completo")
        .in("id", userIds);

      const profilesMap = new Map((profiles || []).map(p => [p.id, p.nome_completo]));

      return data.map(d => ({
        ...d,
        nome_usuario: profilesMap.get(d.user_id) || "Usuário desconhecido",
      }));
    },
    enabled: !!equipeId,
  });
}

// Hook para buscar diagnóstico consolidado
export function useDiagnosticoConsolidado(equipeId: string | null) {
  return useQuery({
    queryKey: ["diagnostico-consolidado", equipeId],
    queryFn: async () => {
      if (!equipeId) return null;

      const { data, error } = await supabase
        .from("diagnostico_consolidado_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("versao", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!equipeId,
  });
}
