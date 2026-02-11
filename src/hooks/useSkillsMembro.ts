import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { useUserRole } from "./useUserRole";

export function useSkillsMembro() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  
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

  // A query só deve disparar quando:
  // 1. Temos um effectiveUserId válido
  // 2. Se há simulação ativa, as roles já devem ter carregado
  // 3. Roles devem ter carregado (para saber se é admin e precisa de fallback)
  const shouldQuery = !!effectiveUserId && !roleLoading && (!isViewingAs || !roleLoading);

  const { data, isPending } = useQuery({
    queryKey: ["skills-membro", effectiveUserId, isAdmin],
    queryFn: async () => {
      if (!effectiveUserId) return { member: null, fallbackEquipeId: null };

      // 1. Buscar dados do membro
      const { data: memberData, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id, papel, cargo, status")
        .eq("user_id", effectiveUserId)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;

      // 2. Se é admin e não tem equipe, buscar primeira equipe disponível (fallback)
      if (!memberData?.equipe_id && isAdmin) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("equipes_skills")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (fallbackError) throw fallbackError;
        return { member: memberData, fallbackEquipeId: fallbackData?.id ?? null };
      }

      return { member: memberData, fallbackEquipeId: null };
    },
    enabled: shouldQuery,
  });

  const memberData = data?.member ?? null;
  const fallbackEquipeId = data?.fallbackEquipeId ?? null;

  // equipeId final: do membro OU fallback admin
  const finalEquipeId = memberData?.equipe_id ?? (isAdmin ? fallbackEquipeId : null) ?? null;

  // isLoading simples: query pendente ou auth/roles carregando
  const isLoading = isPending || authLoading || roleLoading;

  return {
    equipeId: finalEquipeId,
    papel: memberData?.papel as "lider" | "membro" | null,
    isLider: memberData?.papel === "lider",
    isMembro: memberData?.papel === "membro",
    cargo: memberData?.cargo ?? null,
    isLoading,
  };
}
