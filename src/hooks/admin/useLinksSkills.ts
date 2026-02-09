import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LinkSkills {
  id: string;
  equipe_id: string;
  titulo: string;
  url: string;
  descricao: string | null;
  icone: string;
  ordem: number;
  created_at: string;
}

export function useLinksSkills(equipeId?: string | null) {
  const queryClient = useQueryClient();
  const qk = ["links-skills", equipeId];

  const { data: links = [], isLoading } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("links_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data as LinkSkills[];
    },
    enabled: !!equipeId,
  });

  const createLink = useMutation({
    mutationFn: async (input: { equipe_id: string; titulo: string; url: string; descricao?: string; icone?: string }) => {
      const maxOrdem = links.length > 0 ? Math.max(...links.map(l => l.ordem)) + 1 : 0;
      const { data, error } = await supabase.from("links_skills").insert({ ...input, ordem: maxOrdem } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Link adicionado"); },
    onError: () => toast.error("Erro ao adicionar link"),
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LinkSkills> & { id: string }) => {
      const { error } = await supabase.from("links_skills").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Link atualizado"); },
    onError: () => toast.error("Erro ao atualizar link"),
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("links_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Link removido"); },
    onError: () => toast.error("Erro ao remover link"),
  });

  return { links, isLoading, createLink, updateLink, deleteLink };
}
