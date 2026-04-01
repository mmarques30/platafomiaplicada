import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useEnvironmentSafe } from "@/hooks/useEnvironment";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { GraduationCap, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAplicada from "@/assets/logo-aplicada-nova.png";
import { MarIAnaFloatingButton } from "@/components/shared/MarIAnaFloatingButton";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { VisitorExpirationNotice } from "@/components/shared/VisitorExpirationNotice";
import { OnboardingVideo } from "@/components/onboarding/OnboardingVideo";
import { TrocarSenhaModal } from "@/components/auth/TrocarSenhaModal";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";

export function MainLayout() {
  useIdleLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisitante, isAdmin, isLoading } = useUserRole();
  const { profile } = useUserProfile();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const environmentContext = useEnvironmentSafe();
  const { isViewingAs } = useAdminViewContext();
  const { effectivePlan } = useEffectivePlan(isAdmin, isLoading);
  const isBusinessPlan = effectivePlan === 'business_parceria' || effectivePlan === 'business_sistemas';

  // Redirecionar para seleção de ambiente se não selecionado
  useEffect(() => {
    if (!isLoading && environmentContext && !environmentContext.isLoading && !environmentContext.isEnvironmentSelected) {
      navigate("/selecionar-ambiente", { replace: true });
    }
  }, [isLoading, environmentContext, navigate]);

  // Redirecionar Business com primeiro_acesso para tela de boas-vindas
  useEffect(() => {
    if (
      !isLoading &&
      profile?.primeiro_acesso === true &&
      (profile?.plano_mentoria === "business_parceria" || profile?.plano_mentoria === "business_sistemas")
    ) {
      navigate("/welcome-business", { replace: true });
    }
  }, [isLoading, profile, navigate]);

  // Modal só aparece para mentorados (não visitantes) com senha temporária
  const showPasswordModal = !isLoading && !isVisitante && profile?.senha_temporaria === true;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  // Layout unificado para todos os usuários
  return (
    <>
      <OnboardingVideo />
      <SidebarProvider>
        <TopHeader />
        <div className={cn(
          "min-h-screen flex w-full bg-background",
          isAdmin && isViewingAs ? "pt-24" : "pt-14"
        )}>
          <div className="dot-grid-bg" />
          <AppSidebar />
          <div className="flex-1 flex flex-col relative z-[1]">
            <main className="flex-1 overflow-x-hidden">
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <Outlet />
                </PageTransition>
              </AnimatePresence>
            </main>
          </div>
          {(!isLoading && !isVisitante) && <MarIAnaFloatingButton />}
          {(!isLoading && isVisitante) && <VisitorExpirationNotice />}
          
          {/* Modal de senha temporária - apenas para mentorados cadastrados pelo admin */}
          {showPasswordModal && user && (
            <TrocarSenhaModal 
              open={showPasswordModal}
              userId={user.id}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["user-profile"] });
              }}
            />
          )}
        </div>
      </SidebarProvider>
    </>
  );
}
