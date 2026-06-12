import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext } from "@/contexts/AdminViewContext";

export const usePainelDiagnostico = (userId?: string) => {
  const { user } = useAuth();
  const { impersonatedUserId, isViewingAs } = useAdminViewContext();
  // Prioridade: userId explícito > usuário impersonado (simulação admin) > user.id.
  // Sem isso, o admin simulando outro usuário cai no próprio user.id e vê vazio.
  const targetUserId =
    userId ||
    (isViewingAs && impersonatedUserId ? impersonatedUserId : undefined) ||
    user?.id;

  const { data: diagnostico, isLoading: isLoadingDiagnostico } = useQuery({
    queryKey: ["diagnostico", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      // maybeSingle retorna null se não houver registro, sem erro
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
    retry: false, // Desabilitar retries para evitar flicker
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });


  const { data: projetos, isLoading: isLoadingProjetos } = useQuery({
    queryKey: ["projetos-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("projetos_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: sessoes, isLoading: isLoadingSessoes } = useQuery({
    queryKey: ["sessoes-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("sessoes_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("data_sessao", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: tarefas, isLoading: isLoadingTarefas } = useQuery({
    queryKey: ["tarefas-mentoria", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from("tarefas_mentoria")
        .select("*")
        .eq("user_id", targetUserId)
        .order("prazo_entrega", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    diagnostico,
    projetos: projetos || [],
    sessoes: sessoes || [],
    tarefas: tarefas || [],
    profile,
    isLoading: isLoadingDiagnostico || isLoadingProjetos || 
               isLoadingSessoes || isLoadingTarefas || isLoadingProfile,
  };
};
