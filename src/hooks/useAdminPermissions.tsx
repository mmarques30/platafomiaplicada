import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

interface AdminPermission {
  id: string;
  role: string;
  admin_path: string;
  admin_label: string;
  can_access: boolean;
}

export function useAdminPermissions() {
  const { user } = useAuth();
  const { isAdmin, hasRole } = useUserRole();
  const isEquipe = hasRole("equipe");

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["admin-permissions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("role", "equipe")
        .eq("can_access", true);

      if (error) throw error;
      return data as AdminPermission[];
    },
    enabled: !!user && isEquipe && !isAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const canAccessPath = (path: string): boolean => {
    // Admin tem acesso total
    if (isAdmin) return true;

    // Equipe verifica permissões
    if (isEquipe) {
      if (!permissions) return false;
      
      // Verifica correspondência exata ou se é subpath permitido
      return permissions.some(p => {
        // Correspondência exata
        if (p.admin_path === path) return true;
        
        // Se o caminho atual começa com um caminho permitido (exceto /admin)
        if (p.admin_path !== "/admin" && path.startsWith(p.admin_path + "/")) {
          return true;
        }
        
        return false;
      });
    }

    return false;
  };

  return { 
    permissions, 
    canAccessPath, 
    isEquipe,
    isLoading 
  };
}

// Hook para gerenciar permissões (admin only)
export function useManageAdminPermissions() {
  const { data: allPermissions, isLoading, refetch } = useQuery({
    queryKey: ["admin-permissions-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("role", "equipe")
        .order("admin_label");

      if (error) throw error;
      return data as AdminPermission[];
    },
  });

  const togglePermission = async (permissionId: string, canAccess: boolean) => {
    const { error } = await supabase
      .from("admin_permissions")
      .update({ can_access: canAccess, updated_at: new Date().toISOString() })
      .eq("id", permissionId);

    if (error) throw error;
    await refetch();
  };

  return {
    allPermissions,
    isLoading,
    togglePermission,
    refetch,
  };
}
