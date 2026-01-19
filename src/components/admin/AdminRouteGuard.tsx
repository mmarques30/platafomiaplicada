import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AdminRouteGuard({ children, requireAdmin = false }: AdminRouteGuardProps) {
  const { isAdmin, isEquipe, isLoading } = useUserRole();
  
  // Se ainda carregando, não redireciona (deixa o ProtectedRoute pai lidar)
  if (isLoading) return null;
  
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
