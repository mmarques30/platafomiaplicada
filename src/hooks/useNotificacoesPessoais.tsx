import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useNotificacoesPessoais() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notificacoes-pessoais", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useNotificacoesNaoLidasCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notificacoes-nao-lidas-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notificacoes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("lida", false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
}

export function useMarcarNotificacoesComoLidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes-pessoais"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes-nao-lidas-count"] });
    },
  });
}
