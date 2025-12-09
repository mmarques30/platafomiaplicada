import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFerramentasCompartilhadasAdmin = () => {
  const queryClient = useQueryClient();

  const { data: ferramentas, isLoading } = useQuery({
    queryKey: ["ferramentas-compartilhadas-admin"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ferramentas_compartilhadas")
        .select(`
          *,
          profiles(nome_completo, avatar_url)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar ferramentas:", error);
        return [];
      }
      return data || [];
    }
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await (supabase as any)
        .from("ferramentas_compartilhadas")
        .update({ ativo })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramentas-compartilhadas-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ferramentas-compartilhadas"] });
      toast.success("Status atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    }
  });

  const deleteFerramenta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("ferramentas_compartilhadas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramentas-compartilhadas-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ferramentas-compartilhadas"] });
      toast.success("Ferramenta excluída!");
    },
    onError: () => {
      toast.error("Erro ao excluir ferramenta");
    }
  });

  return {
    ferramentas,
    isLoading,
    toggleAtivo: toggleAtivo.mutate,
    deleteFerramenta: deleteFerramenta.mutate,
  };
};
