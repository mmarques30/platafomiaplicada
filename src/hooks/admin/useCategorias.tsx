import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias-modulos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_modulos")
        .select("*")
        .order("ordem");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoria: any) => {
      const { data, error } = await supabase
        .from("categorias_modulos")
        .insert(categoria)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-modulos"] });
      toast.success("Categoria criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...categoria }: any) => {
      const { data, error } = await supabase
        .from("categorias_modulos")
        .update(categoria)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-modulos"] });
      toast.success("Categoria atualizada!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categorias_modulos")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-modulos"] });
      toast.success("Categoria excluída!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });
}
