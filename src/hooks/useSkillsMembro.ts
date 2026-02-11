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
  const shouldQuery = !!effectiveUserId && (!isViewingAs || !roleLoading);

  const { data, isPending } = useQuery({
    queryKey: ["skills-membro", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;
      const { data, error } = await supabase
        .from("membros_equipe_skills")
        .select("equipe_id, papel, cargo, status")
        .eq("user_id", effectiveUserId)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: shouldQuery,
  });

  // Fallback para admin: buscar primeira equipe disponível quando admin não é membro direto
  const needsFallback = isAdmin && !roleLoading && !authLoading && !isPending && !data?.equipe_id;
  
  const { data: fallbackEquipeId, isLoading: fallbackLoading } = useQuery({
    queryKey: ["skills-admin-fallback-equipe"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipes_skills")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    },
    enabled: needsFallback,
  });

  // equipeId final: do membro OU fallback admin
  const finalEquipeId = data?.equipe_id ?? (isAdmin ? fallbackEquipeId : null) ?? null;

  // isLoading inclui fallback quando admin sem equipe
  const isLoading = isPending || authLoading || roleLoading || (needsFallback && fallbackLoading);

  return {
    equipeId: finalEquipeId,
    papel: data?.papel as "lider" | "membro" | null,
    isLider: data?.papel === "lider",
    isMembro: data?.papel === "membro",
    cargo: data?.cargo ?? null,
    isLoading,
  };
}
