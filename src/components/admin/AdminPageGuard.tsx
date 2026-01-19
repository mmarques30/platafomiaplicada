import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminPageGuardProps {
  children: ReactNode;
  path: string;
}

export function AdminPageGuard({ children, path }: AdminPageGuardProps) {
  const { canAccessPath, isLoading } = useAdminPermissions();
  const { isAdmin } = useUserRole();

  // Admin tem acesso total
  if (isAdmin) {
    return <>{children}</>;
  }

  // Enquanto carrega permissões, mostra loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verifica permissão para equipe
  if (!canAccessPath(path)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
