import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ==================== FERRAMENTAS IA ====================
export const useFerramentasAdmin = () => {
  return useQuery({
    queryKey: ["ferramentas-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ferramentas_ia")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFerramenta = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("ferramentas_ia").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramentas-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
      toast({ title: "Ferramenta criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar ferramenta", variant: "destructive" });
    },
  });
};

export const useUpdateFerramenta = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { error } = await supabase
        .from("ferramentas_ia")
        .update(values)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramentas-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
      toast({ title: "Ferramenta atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar ferramenta", variant: "destructive" });
    },
  });
};

export const useDeleteFerramenta = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ferramentas_ia")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferramentas-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
      toast({ title: "Ferramenta deletada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao deletar ferramenta", variant: "destructive" });
    },
  });
};

// ==================== PROMPTS ====================
export const usePromptsAdmin = () => {
  return useQuery({
    queryKey: ["prompts-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("biblioteca_prompts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePrompt = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("biblioteca_prompts").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts-admin"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast({ title: "Prompt criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar prompt", variant: "destructive" });
    },
  });
};

export const useUpdatePrompt = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { error } = await supabase
        .from("biblioteca_prompts")
        .update(values)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts-admin"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast({ title: "Prompt atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar prompt", variant: "destructive" });
    },
  });
};

export const useDeletePrompt = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("biblioteca_prompts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts-admin"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast({ title: "Prompt deletado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao deletar prompt", variant: "destructive" });
    },
  });
};

// ==================== IA COPIE E USE ====================
export const useIACopieUseAdmin = () => {
  return useQuery({
    queryKey: ["ia-copie-use-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ia_copie_use")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateIACopieUse = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("ia_copie_use").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ia-copie-use-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ia-copie-use"] });
      toast({ title: "Item criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar item", variant: "destructive" });
    },
  });
};

export const useUpdateIACopieUse = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { error } = await supabase
        .from("ia_copie_use")
        .update(values)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ia-copie-use-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ia-copie-use"] });
      toast({ title: "Item atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar item", variant: "destructive" });
    },
  });
};

export const useDeleteIACopieUse = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ia_copie_use")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ia-copie-use-admin"] });
      queryClient.invalidateQueries({ queryKey: ["ia-copie-use"] });
      toast({ title: "Item deletado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao deletar item", variant: "destructive" });
    },
  });
};

// ==================== MÉTODOS ====================
export const useMetodosAdmin = () => {
  return useQuery({
    queryKey: ["metodos-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metodos_aplicar")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateMetodo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("metodos_aplicar").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metodos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["metodos"] });
      toast({ title: "Método criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar método", variant: "destructive" });
    },
  });
};

export const useUpdateMetodo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { error } = await supabase
        .from("metodos_aplicar")
        .update(values)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metodos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["metodos"] });
      toast({ title: "Método atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar método", variant: "destructive" });
    },
  });
};

export const useDeleteMetodo = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("metodos_aplicar")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metodos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["metodos"] });
      toast({ title: "Método deletado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao deletar método", variant: "destructive" });
    },
  });
};
