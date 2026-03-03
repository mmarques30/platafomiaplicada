import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, UserRole } from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: UserRole;
  requireAnyRole?: UserRole[];
}

export function ProtectedRoute({ children, requireRole, requireAnyRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isLoading: roleLoading, roles, isVisitante } = useUserRole();

  const needsRoleCheck = Boolean(requireRole) || (Array.isArray(requireAnyRole) && requireAnyRole.length > 0);

  // Enquanto estiver carregando auth ou papéis (quando necessário), apenas mostra loader
  if (authLoading || (needsRoleCheck && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Após carregar auth, se não houver usuário, redireciona para /auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Checagem de papéis somente quando necessário
  if (requireRole && !hasRole(requireRole)) {
    return <Navigate to="/" replace />;
  }

  if (requireAnyRole && !requireAnyRole.some(role => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}