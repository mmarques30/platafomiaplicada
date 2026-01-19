import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AdminRouteGuard({ children, requireAdmin = false }: AdminRouteGuardProps) {
  const { isAdmin, isEquipe, isLoading, roles } = useUserRole();
  
  // Se ainda carregando E não tem roles em cache, mostra loading
  // Se tem roles em cache, usa elas mesmo durante loading
  if (isLoading && roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Se requer admin e não é admin, redireciona para seletor de ambiente
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Se não tem nem admin nem equipe, redireciona para home
  if (!isAdmin && !isEquipe) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
