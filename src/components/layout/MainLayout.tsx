import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAplicada from "@/assets/logo-aplicada-nova.png";
import { MarIAnaFloatingButton } from "@/components/shared/MarIAnaFloatingButton";

export function MainLayout() {
  useIdleLogout();
  const { isVisitante, isLoading } = useUserRole();
  const { profile } = useUserProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Layout unificado para todos os usuários
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopHeader />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <MarIAnaFloatingButton />
      </div>
    </SidebarProvider>
  );
}
