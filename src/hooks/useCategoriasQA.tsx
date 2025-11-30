import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type CategoriaQA = {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export function useCategoriasQA() {
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias-qa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_qa")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as CategoriaQA[];
    },
  });

  const createCategoria = useMutation({
    mutationFn: async (dados: Omit<CategoriaQA, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("categorias_qa")
        .insert([dados as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-qa"] });
      toast({ title: "Categoria criada com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoria = useMutation({
    mutationFn: async ({ id, ...dados }: Partial<CategoriaQA> & { id: string }) => {
      const { error } = await supabase
        .from("categorias_qa")
        .update(dados)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-qa"] });
      toast({ title: "Categoria atualizada!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categorias_qa")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-qa"] });
      toast({ title: "Categoria excluída!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    categorias,
    isLoading,
    createCategoria: createCategoria.mutate,
    updateCategoria: updateCategoria.mutate,
    deleteCategoria: deleteCategoria.mutate,
    isCriando: createCategoria.isPending,
    isAtualizando: updateCategoria.isPending,
  };
}
