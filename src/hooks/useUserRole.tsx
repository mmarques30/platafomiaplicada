import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "mentorado" | "aluno_trilha" | null;

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
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
    staleTime: 0, // Sempre revalidar
    gcTime: 0,    // Limpar cache imediatamente quando desabilitado
  });

  const hasRole = (role: UserRole) => {
    if (!roles) return false;
    return roles.includes(role);
  };

  const isAdmin = hasRole("admin");
  const isMentorado = hasRole("mentorado");
  const isAlunoTrilha = hasRole("aluno_trilha");
  const hasAccess = isAdmin || isMentorado || isAlunoTrilha;

  return {
    roles: roles || [],
    hasRole,
    isAdmin,
    isMentorado,
    isAlunoTrilha,
    hasAccess,
    isLoading
  };
}