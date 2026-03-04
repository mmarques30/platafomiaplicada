import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext } from "@/contexts/AdminViewContext";

export type UserRole = "admin" | "equipe" | "mentorado" | "aluno_trilha" | "visitante" | "parceiros" | null;

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles, isPending } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(r => r.role as UserRole);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,   // 5 minutos
    gcTime: 1000 * 60 * 10,     // 10 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Obter viewAs do context (safe access)
  let viewAs: string | null = null;
  let isViewingAs = false;
  
  try {
    const context = useAdminViewContext();
    viewAs = context.viewAs;
    isViewingAs = context.isViewingAs;
  } catch {
    // Context not available
  }

  const hasRole = (role: UserRole) => {
    if (!roles) return false;
    return roles.includes(role);
  };

  const isAdmin = hasRole("admin");
  const isEquipe = hasRole("equipe");
  const isMentorado = hasRole("mentorado");
  const isAlunoTrilha = hasRole("aluno_trilha");
  const realIsVisitante = hasRole("visitante");
  const isParceiro = hasRole("parceiros");

  // Se admin está simulando visitante
  const effectiveIsVisitante = isAdmin && isViewingAs && viewAs === "visitante" 
    ? true 
    : realIsVisitante;

  const hasAccess = isAdmin || isMentorado || isAlunoTrilha || isParceiro || effectiveIsVisitante;

  return {
    roles: roles || [],
    hasRole,
    isAdmin,
    isEquipe,
    isMentorado,
    isAlunoTrilha,
    isParceiro,
    isVisitante: effectiveIsVisitante,
    realIsVisitante,
    hasAccess,
    isLoading: isPending
  };
}