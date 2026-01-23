import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LinkBusiness {
  id: string;
  contrato_id: string;
  titulo: string;
  url: string;
  descricao?: string;
  icone: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkInput {
  contrato_id: string;
  titulo: string;
  url: string;
  descricao?: string;
  icone?: string;
  ordem?: number;
}

export function useLinksBusiness(contratoId?: string) {
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["links-business", contratoId],
    queryFn: async () => {
      if (!contratoId) return [];

      const { data, error } = await supabase
        .from("links_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as LinkBusiness[];
    },
    enabled: !!contratoId,
  });

  const createLink = useMutation({
    mutationFn: async (input: LinkInput) => {
      // Pegar maior ordem atual
      const maxOrdem = links.length > 0 
        ? Math.max(...links.map(l => l.ordem)) + 1 
        : 0;

      const { data, error } = await supabase
        .from("links_business")
        .insert({
          ...input,
          ordem: input.ordem ?? maxOrdem,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links-business", contratoId] });
      toast.success("Link adicionado com sucesso");
    },
    onError: (error: Error) => {
      console.error("Erro ao criar link:", error);
      toast.error("Erro ao adicionar link");
    },
  });

  const updateLink = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LinkBusiness> & { id: string }) => {
      const { data, error } = await supabase
        .from("links_business")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links-business", contratoId] });
      toast.success("Link atualizado");
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar link:", error);
      toast.error("Erro ao atualizar link");
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("links_business")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links-business", contratoId] });
      toast.success("Link removido");
    },
    onError: (error: Error) => {
      console.error("Erro ao remover link:", error);
      toast.error("Erro ao remover link");
    },
  });

  const reorderLinks = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("links_business")
          .update({ ordem: index })
          .eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links-business", contratoId] });
    },
    onError: (error: Error) => {
      console.error("Erro ao reordenar links:", error);
      toast.error("Erro ao reordenar links");
    },
  });

  return {
    links,
    isLoading,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
  };
}
