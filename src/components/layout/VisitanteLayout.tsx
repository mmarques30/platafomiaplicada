import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Home, GraduationCap, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAplicada from "@/assets/logo-aplicada-nova.png";

interface VisitanteLayoutProps {
  children: ReactNode;
}

export function VisitanteLayout({ children }: VisitanteLayoutProps) {
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: GraduationCap, label: "Academy", path: "/trilhas" },
    { icon: Users, label: "Comunidade", path: "/comunidade" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Simplificada */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/">
            <img src={logoAplicada} alt="IAplicada" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
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

        {/* Sair */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Simplificado */}
        <header className="h-16 border-b border-border bg-card px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-foreground">
              Oi, {profile?.nome_completo?.split(' ')[0] || 'Visitante'}!
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Conta Visitante
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
