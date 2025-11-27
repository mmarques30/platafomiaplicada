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

  // Layout simplificado para visitantes (SEM SidebarProvider)
  if (isVisitante) {
    const visitanteMenuItems = [
      { icon: GraduationCap, label: "Academy", path: "/trilhas" },
      { icon: Users, label: "Comunidade", path: "/comunidade" },
    ];

    return (
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Simplificada Fixa */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-6 border-b border-border">
            <Link to="/trilhas">
              <img src={logoAplicada} alt="IAplicada" className="h-8 w-auto" />
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {visitanteMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card px-8 flex items-center justify-between">
            <span className="text-lg font-medium text-foreground">
              Oi, {profile?.nome_completo?.split(' ')[0] || 'Visitante'}!
            </span>
            <div className="text-sm text-muted-foreground">Conta Visitante</div>
          </header>

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Layout normal para usuários aplicados
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
      </div>
    </SidebarProvider>
  );
}
