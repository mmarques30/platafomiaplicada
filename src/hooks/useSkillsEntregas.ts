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

  // Buscar entregas - líder vê todas, membro vê apenas as suas
  const { data: entregas, isLoading } = useQuery({
    queryKey: ["entregas-skills", effectiveUserId, equipeId, isLider],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      
      let query = supabase
        .from("entregas_skills")
        .select(`
          *,
          responsavel:responsavel_id (id, nome_completo, avatar_url)
        `)
        .order("prazo", { ascending: true, nullsFirst: false });

      if (isLider && equipeId) {
        // Líder vê todas as entregas da equipe
        query = query.eq("equipe_id", equipeId);
      } else {
        // Membro vê apenas as próprias entregas
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

  return {
    entregas,
    isLoading,
    isLider,
    submeterEntrega,
    iniciarEntrega,
  };
}
