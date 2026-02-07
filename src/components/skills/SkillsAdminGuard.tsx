import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";

interface SkillsAdminGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Guard centralizado para páginas Skills restritas a admin/líder.
 * 
 * - Aguarda o carregamento completo de roles e membro
 * - Mostra spinner durante o loading
 * - Redireciona para redirectTo (default: /skills/projeto) se sem acesso
 * - Renderiza children apenas quando acesso confirmado
 */
export default function SkillsAdminGuard({
  children,
  redirectTo = "/skills/projeto",
}: SkillsAdminGuardProps) {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isLider, isLoading: membroLoading } = useSkillsMembro();
  const isLoading = roleLoading || membroLoading;

  useEffect(() => {
    if (!isLoading && !isAdmin && !isLider) {
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, isAdmin, isLider, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin && !isLider) {
    return null;
  }

  return <>{children}</>;
}
