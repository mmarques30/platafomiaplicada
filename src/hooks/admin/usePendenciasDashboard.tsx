import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PendenciaDashboard {
  id: string;
  tipo: string;
  referencia_id: string | null;
  titulo: string;
  descricao: string | null;
  link: string;
  icone: string | null;
  ativo: boolean;
  ordem: number;
  planos_aplicaveis: string[];
  created_at: string;
  updated_at: string;
}

export function usePendenciasDashboard() {
  return useQuery({
    queryKey: ["pendencias-dashboard-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pendencias_dashboard")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as PendenciaDashboard[];
    },
  });
}

export function usePendenciasAtivas(userPlan?: string | null) {
  return useQuery({
    queryKey: ["pendencias-dashboard-ativas", userPlan],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pendencias_dashboard")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      
      // Filtrar por plano do usuário se fornecido
      let filtered = data as PendenciaDashboard[];
      if (userPlan) {
        filtered = filtered.filter(p => 
          p.planos_aplicaveis?.includes(userPlan)
        );
      }
      
      return filtered;
    },
  });
}

export function useTogglePendencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("pendencias_dashboard")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-admin"] });
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-ativas"] });
      toast.success("Pendência atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar pendência");
      console.error(error);
    },
  });
}

export function useUpdatePendencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pendencia: Partial<PendenciaDashboard> & { id: string }) => {
      const { error } = await supabase
        .from("pendencias_dashboard")
        .update(pendencia)
        .eq("id", pendencia.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-admin"] });
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-ativas"] });
      toast.success("Pendência atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar pendência");
      console.error(error);
    },
  });
}

export function useCreatePendencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pendencia: Omit<PendenciaDashboard, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase
        .from("pendencias_dashboard")
        .insert(pendencia);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-admin"] });
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-ativas"] });
      toast.success("Pendência criada!");
    },
    onError: (error) => {
      toast.error("Erro ao criar pendência");
      console.error(error);
    },
  });
}

export function useDeletePendencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pendencias_dashboard")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-admin"] });
      queryClient.invalidateQueries({ queryKey: ["pendencias-dashboard-ativas"] });
      toast.success("Pendência excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir pendência");
      console.error(error);
    },
  });
}
