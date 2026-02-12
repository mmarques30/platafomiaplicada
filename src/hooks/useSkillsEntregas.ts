import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSkillsMembro } from "./useSkillsMembro";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { useUserRole } from "./useUserRole";
import { toast } from "sonner";

export function useSkillsEntregas() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { equipeId, isLider } = useSkillsMembro();
  const queryClient = useQueryClient();
  
  // Obter contexto de simulação
  let impersonatedUserId: string | null = null;
  let isViewingAs = false;
  
  try {
    const context = useAdminViewContext();
    impersonatedUserId = context.impersonatedUserId;
    isViewingAs = context.isViewingAs;
  } catch {
    // Context não disponível
  }
  
  // Se admin está simulando, usar o ID do usuário simulado
  const effectiveUserId = (isAdmin && isViewingAs && impersonatedUserId) 
    ? impersonatedUserId 
    : user?.id;

  // Buscar entregas - admin/líder vê todas da equipe, membro vê as suas + sem responsável
  const { data: entregas, isLoading } = useQuery({
    queryKey: ["entregas-skills", effectiveUserId, equipeId, isLider, isAdmin],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      
      let query = supabase
        .from("entregas_skills")
        .select(`
          *,
          responsavel:responsavel_id (id, nome_completo, avatar_url)
        `)
        .order("prazo", { ascending: true, nullsFirst: false });

      if ((isLider || isAdmin) && equipeId) {
        // Admin ou Líder vê todas as entregas da equipe
        query = query.eq("equipe_id", equipeId);
      } else if (equipeId) {
        // Membro vê suas entregas + entregas sem responsável da equipe
        query = query.eq("equipe_id", equipeId).or(`responsavel_id.eq.${effectiveUserId},responsavel_id.is.null`);
      } else {
        // Fallback: apenas as próprias
        query = query.eq("responsavel_id", effectiveUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveUserId,
  });

  // Mutation para submeter entrega para validação
  const submeterEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({ status: "aguardando_validacao" })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega enviada para validação!");
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
    },
    onError: () => {
      toast.error("Erro ao enviar entrega");
    },
  });

  // Mutation para iniciar entrega
  const iniciarEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({ status: "em_andamento" })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega iniciada!");
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
    },
    onError: () => {
      toast.error("Erro ao iniciar entrega");
    },
  });

  // Mutation para atualizar status (drag-and-drop Kanban)
  const atualizarStatus = useMutation({
    mutationFn: async ({ entregaId, novoStatus }: { entregaId: string; novoStatus: string }) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({ status: novoStatus })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  return {
    entregas,
    isLoading,
    isLider,
    submeterEntrega,
    iniciarEntrega,
    atualizarStatus,
  };
}
