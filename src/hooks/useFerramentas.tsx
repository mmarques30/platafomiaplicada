import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook para IAs Copie e Use
export function useIACopieUse() {
  return useQuery({
    queryKey: ["ia-copie-use"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ia_copie_use")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para Ferramentas de IA
export function useFerramentasIA() {
  return useQuery({
    queryKey: ["ferramentas-ia"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ferramentas_ia")
        .select("*")
        .eq("ativo", true)
        .order("avaliacao", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para Biblioteca de Prompts
export function usePrompts() {
  return useQuery({
    queryKey: ["biblioteca-prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("biblioteca_prompts")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para Métodos para Aplicar
export function useMetodos() {
  return useQuery({
    queryKey: ["metodos-aplicar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metodos_aplicar")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para Materiais Gratuitos
export function useMateriaisGratuitos() {
  return useQuery({
    queryKey: ["materiais-gratuitos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_gratuitos")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para criar favorito
export function useAddFavorito() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ itemId, tipo }: { itemId: string; tipo: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("favoritos")
        .insert({ user_id: user.id, item_id: itemId, tipo });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
      toast({
        title: "Adicionado aos favoritos!",
        description: "Item salvo com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar aos favoritos",
        variant: "destructive",
      });
    },
  });
}
