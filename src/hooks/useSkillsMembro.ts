import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { useUserRole } from "./useUserRole";
import { useSkillsAdminTeam } from "@/contexts/SkillsAdminTeamContext";

export function useSkillsMembro() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { selectedEquipeId } = useSkillsAdminTeam();
  
  // Obter contexto de simulação (admin visualizando como outro usuário)
  let impersonatedUserId: string | null = null;
  let isViewingAs = false;
  
  try {
    const context = useAdminViewContext();
    impersonatedUserId = context.impersonatedUserId;
    isViewingAs = context.isViewingAs;
  } catch {
    // Context não disponível
  }
  
  // Se admin está simulando outro usuário, usar o ID do usuário simulado
  const effectiveUserId = (isAdmin && isViewingAs && impersonatedUserId) 
    ? impersonatedUserId 
    : user?.id;

  const shouldQuery = !!effectiveUserId && !roleLoading && (!isViewingAs || !roleLoading);

  const { data, isPending } = useQuery({
    queryKey: ["skills-membro", effectiveUserId, isAdmin],
    queryFn: async () => {
      if (!effectiveUserId) return { member: null };

      // Buscar dados do membro
      const { data: memberData, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id, papel, cargo, status")
        .eq("user_id", effectiveUserId)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;

      return { member: memberData };
    },
    enabled: shouldQuery,
  });

  const memberData = data?.member ?? null;

  // equipeId: do membro, ou seleção manual do admin via contexto
  const finalEquipeId = memberData?.equipe_id 
    ?? (isAdmin && !isViewingAs ? selectedEquipeId : null) 
    ?? null;

  // Admin precisa selecionar equipe quando não tem equipe própria e não está simulando
  const needsTeamSelection = isAdmin && !isViewingAs && !memberData?.equipe_id && !selectedEquipeId && !isPending && !authLoading && !roleLoading;

  const isLoading = isPending || authLoading || roleLoading || (!data && !authLoading);

  return {
    equipeId: finalEquipeId,
    papel: memberData?.papel as "lider" | "membro" | null,
    isLider: memberData?.papel === "lider",
    isMembro: memberData?.papel === "membro",
    cargo: memberData?.cargo ?? null,
    isLoading,
    needsTeamSelection,
  };
}
