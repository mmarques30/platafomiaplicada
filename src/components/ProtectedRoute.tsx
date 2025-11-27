import { ReactNode, useEffect } from "react";
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

  // Debug logs
  useEffect(() => {
    console.log("[ProtectedRoute] Auth Loading:", authLoading);
    console.log("[ProtectedRoute] Role Loading:", roleLoading);
    console.log("[ProtectedRoute] User:", user?.email);
    console.log("[ProtectedRoute] Roles:", roles);
    console.log("[ProtectedRoute] Require Role:", requireRole);
    console.log("[ProtectedRoute] Require Any Role:", requireAnyRole);
  }, [authLoading, roleLoading, user, roles, requireRole, requireAnyRole]);

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
    console.log("[ProtectedRoute] No user - redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // Checagem de papéis somente quando necessário
  if (requireRole && !hasRole(requireRole)) {
    console.log("[ProtectedRoute] Missing required role:", requireRole);
    return <Navigate to="/" replace />;
  }

  if (requireAnyRole && !requireAnyRole.some(role => hasRole(role))) {
    console.log("[ProtectedRoute] Missing any of required roles:", requireAnyRole);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}