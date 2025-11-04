import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useFerramentasCompartilhadas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ferramentas, isLoading } = useQuery({
    queryKey: ["ferramentas-compartilhadas"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ferramentas_compartilhadas")
        .select(`
          *,
          profiles(nome_completo, avatar_url)
        `)
        .eq("ativo", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar ferramentas:", error);
        return [];
      }
      return data || [];
    }
  });

  const createFerramenta = useMutation({
    mutationFn: async (ferramenta: any) => {
      const { data, error } = await (supabase as any)
        .from("ferramentas_compartilhadas")
        .insert({
          ...ferramenta,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramentas-compartilhadas"] });
      queryClient.invalidateQueries({ queryKey: ["minha-evolucao"] });
      toast.success("Ferramenta compartilhada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao compartilhar ferramenta");
    }
  });

  return {
    ferramentas,
    isLoading,
    createFerramenta: createFerramenta.mutate,
    isCreating: createFerramenta.isPending,
  };
};
