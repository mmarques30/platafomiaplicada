import React from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAvisosAtivosCount } from "@/hooks/useAvisosPublicos";
import { cn } from "@/lib/utils";
import logoAplicada from "@/assets/logo-aplicada.png";
import { useLocation } from "react-router-dom";

export function TopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin, isVisitante } = useUserRole();
  const { hasAccessTo, plan } = useUserPlan();
  const { profile } = useUserProfile();
  
  // Detectar rotas ativas para dropdowns
  const isCursosActive = ['/trilhas', '/mentoria', '/lab', '/skills'].some(path => location.pathname.startsWith(path));
  const isFerramentasActive = ['/ia-copie-use', '/biblioteca-ferramentas', '/biblioteca-prompts', '/metodos-aplicar'].some(path => location.pathname.startsWith(path));

  const { data: avisosCount } = useAvisosAtivosCount();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
  };

  const getInitials = (email?: string | null, nome?: string | null) => {
    if (nome) {
      const names = nome.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return nome.substring(0, 2).toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const firstName = profile?.nome_completo?.split(" ")[0] || "Usuário";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* ESQUERDA: SidebarTrigger + Logo */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-accent/50 transition-colors" />
          </div>

        {/* CENTRO: Menu de Navegação Horizontal - Tech Executive */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => cn(
              "text-sm font-semibold smooth-transition",
              isActive ? "text-primary" : "text-foreground hover:text-primary"
            )}
          >
            Início
          </NavLink>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "text-sm font-medium h-auto p-0 smooth-transition hover:bg-transparent",
                  isCursosActive ? "text-primary" : "text-foreground hover:text-primary"
                )}
              >
                Meus Cursos
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 bg-popover border-border text-popover-foreground">
                  <DropdownMenuItem asChild>
              <Link to="/trilhas" className="cursor-pointer">
                Academy
              </Link>
                  </DropdownMenuItem>
                  
                  {(hasAccessTo("lab") || isAdmin) && (
                    <DropdownMenuItem asChild>
                      <Link to="/lab" className="cursor-pointer">
                        Lab
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {(hasAccessTo("club") || isAdmin) && (
                    <DropdownMenuItem asChild>
                      <Link to="/mentoria" className="cursor-pointer">
                        Club
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {(hasAccessTo("skills") || isAdmin) && (
                    <DropdownMenuItem asChild>
                      <Link to="/skills" className="cursor-pointer">
                        Skills
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
          </DropdownMenu>
          
          {!isVisitante && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm font-medium h-auto p-0 smooth-transition hover:bg-transparent",
                    isFerramentasActive ? "text-primary" : "text-foreground hover:text-primary"
                  )}
                >
                  Ferramentas
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 bg-popover border-border text-popover-foreground">
                <DropdownMenuItem asChild>
                  <Link to="/ia-copie-use" className="cursor-pointer">
                    IA "Copie e Use"
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/biblioteca-ferramentas" className="cursor-pointer">
                    Biblioteca de Ferramentas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/biblioteca-prompts" className="cursor-pointer">
                    Biblioteca de Prompts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/metodos-aplicar" className="cursor-pointer">
                    Métodos para Aplicar
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
        </nav>

        {/* DIREITA: Notificações + Avatar com Nome */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => navigate("/notificacoes")}
          >
            <Bell className="h-5 w-5" />
            {avisosCount && avisosCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {avisosCount > 9 ? "9+" : avisosCount}
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 text-foreground hover:text-primary h-auto px-2 py-1">
                <Avatar className="h-8 w-8 border-2 border-border">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user?.email, profile?.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {firstName}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="cursor-pointer">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/configuracoes" className="cursor-pointer">
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
