import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: UserRole;
  requireAnyRole?: UserRole[];
}

export function ProtectedRoute({ children, requireRole, requireAnyRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, roles, isLoading: roleLoading } = useUserRole();

  // Move useEffect to the top, before any conditional returns
  useEffect(() => {
    if (!roleLoading && roles.length === 0 && user) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Seu acesso está pendente de aprovação. Entre em contato com o administrador.",
      });
      
      supabase.auth.signOut();
    }
  }, [roleLoading, roles, user]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!roleLoading && roles.length === 0) {
    return <Navigate to="/auth" replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    return <Navigate to="/" replace />;
  }

  if (requireAnyRole && !requireAnyRole.some(role => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}