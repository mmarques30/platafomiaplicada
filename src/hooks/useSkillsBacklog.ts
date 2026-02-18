import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsMembro } from "./useSkillsMembro";
import { toast } from "sonner";

export interface BacklogItem {
  id: string;
  titulo: string;
  descricao: string | null;
  area_impactada: string | null;
  status: string | null;
  prioridade: string | null;
  responsavel_id: string | null;
  colaborador_id: string | null;
  horas_estimadas_economia: number | null;
  tags: string[] | null;
  origem: string | null;
  observacoes: string | null;
  ordem: number | null;
  equipe_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  trilhas_recomendadas: any[] | null;
  responsavel: { id: string; nome: string; avatar_url: string | null } | null;
  colaborador: { id: string; nome: string; avatar_url: string | null } | null;
}

export function useSkillsBacklog() {
  const { equipeId } = useSkillsMembro();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["backlog-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];

      const { data, error } = await supabase
        .from("backlog_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("ordem", { ascending: true });
      if (error) throw error;

      const allProfileIds = [
        ...(data?.map(b => b.responsavel_id).filter(Boolean) || []),
        ...(data?.map(b => b.colaborador_id).filter(Boolean) || []),
      ];
      const uniqueIds = [...new Set(allProfileIds)];
      let responsaveis: Record<string, any> = {};

      if (uniqueIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles_community" as any)
          .select("id, nome_completo, avatar_url")
          .in("id", uniqueIds as string[]);

        if (profilesData) {
          responsaveis = profilesData.reduce((acc: Record<string, any>, p: any) => {
            acc[p.id] = { id: p.id, nome: p.nome_completo, avatar_url: p.avatar_url };
            return acc;
          }, {});
        }
      }

      return (data?.map(item => ({
        ...item,
        responsavel: item.responsavel_id ? responsaveis[item.responsavel_id] || null : null,
        colaborador: item.colaborador_id ? responsaveis[item.colaborador_id] || null : null,
      })) || []) as BacklogItem[];
    },
    enabled: !!equipeId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("backlog_skills")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlog-skills"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar status do projeto");
    },
  });

  const addItem = useMutation({
    mutationFn: async (item: {
      titulo: string;
      descricao?: string;
      area_impactada?: string;
      prioridade?: string;
      horas_estimadas_economia?: number;
    }) => {
      if (!equipeId) throw new Error("Equipe não encontrada");
      const { error } = await supabase
        .from("backlog_skills")
        .insert({
          ...item,
          equipe_id: equipeId,
          origem: "manual",
          status: "levantado",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlog-skills"] });
      toast.success("Projeto adicionado ao backlog");
    },
    onError: () => {
      toast.error("Erro ao adicionar projeto");
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...fields }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("backlog_skills")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlog-skills"] });
      toast.success("Projeto atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar projeto");
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("backlog_skills")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlog-skills"] });
      toast.success("Projeto removido");
    },
    onError: () => {
      toast.error("Erro ao remover projeto");
    },
  });

  return {
    items: items || [],
    isLoading,
    updateStatus,
    addItem,
    updateItem,
    deleteItem,
  };
}
