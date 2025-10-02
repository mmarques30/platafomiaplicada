import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAvisos() {
  return useQuery({
    queryKey: ["admin-avisos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAviso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aviso: any) => {
      const { error } = await supabase.from("avisos").insert(aviso);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-avisos"] });
      toast.success("Aviso criado com sucesso!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useUpdateAviso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...aviso }: any) => {
      const { error } = await supabase.from("avisos").update(aviso).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-avisos"] });
      toast.success("Aviso atualizado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}

export function useDeleteAviso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("avisos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-avisos"] });
      toast.success("Aviso deletado!");
    },
    onError: (error: any) => toast.error("Erro: " + error.message),
  });
}
