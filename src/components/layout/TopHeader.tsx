import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAvisosAtivosCount } from "@/hooks/useAvisosPublicos";
import { useProdutosAtivos } from "@/hooks/admin/useProdutos";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

export function TopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin, isVisitante } = useUserRole();
  const { hasAccessTo, plan } = useUserPlan();
  const { profile } = useUserProfile();
  const { data: produtosAtivos } = useProdutosAtivos();
  
  // Verifica se um produto está ativo pelo slug
  const isProdutoAtivo = (slug: string) => {
    return produtosAtivos?.some(p => p.slug === slug) ?? false;
  };
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
    <header 
      className={cn(
        "fixed top-0 z-50 w-full border-b border-[#3a3b36] bg-[#2F302B] transition-transform duration-300 ease-in-out",
        isScrolled && !isHovered ? "-translate-y-full" : "translate-y-0"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-14 w-full">
        {/* LEFT: SidebarTrigger - posição absoluta à esquerda */}
        <div className="absolute left-0 top-0 h-full flex items-center ml-1 md:ml-2">
          <SidebarTrigger className="h-10 w-10 md:h-7 md:w-7 text-white/80 hover:text-white hover:bg-white/10 transition-colors" />
        </div>

        {/* CENTER: Horizontal Navigation - centralizado na viewport com posição absoluta */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-8">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => cn(
              "text-sm font-medium transition-colors",
              isActive ? "text-white" : "text-white/60 hover:text-white"
            )}
          >
            Início
          </NavLink>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "text-sm font-medium h-auto p-0 transition-colors hover:bg-transparent",
                  isCursosActive ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                Meus Cursos
                <ChevronDown className="ml-1 h-4 w-4" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 bg-popover border-border">
              {/* Academy: não aparece para plano Club pois já têm acesso ao Club */}
              {plan !== "club" && (
                <DropdownMenuItem asChild>
                  <Link to="/trilhas" className="cursor-pointer">
                    Academy
                  </Link>
                </DropdownMenuItem>
              )}
              
              {(hasAccessTo("lab") || isAdmin) && isProdutoAtivo("lab") && (
                <DropdownMenuItem asChild>
                  <Link to="/lab" className="cursor-pointer">
                    Lab
                  </Link>
                </DropdownMenuItem>
              )}
              
              {(hasAccessTo("club") || isAdmin) && isProdutoAtivo("club") && (
                <DropdownMenuItem asChild>
                  <Link to="/mentoria" className="cursor-pointer">
                    Club
                  </Link>
                </DropdownMenuItem>
              )}
              
              {(hasAccessTo("skills") || isAdmin) && isProdutoAtivo("skills") && (
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
                    "text-sm font-medium h-auto p-0 transition-colors hover:bg-transparent",
                    isFerramentasActive ? "text-white" : "text-white/60 hover:text-white"
                  )}
                >
                  Ferramentas
                  <ChevronDown className="ml-1 h-4 w-4" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-popover border-border">
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

        {/* RIGHT: Notifications + Avatar - posição absoluta à direita */}
        <div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-4">
          <Button
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/notificacoes")}
          >
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            {avisosCount && avisosCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                {avisosCount > 9 ? "9+" : avisosCount}
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-auto px-2 py-1.5 hover:bg-white/10">
                <Avatar className="h-8 w-8 border border-white/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(user?.email, profile?.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-white">
                  {firstName}
                </span>
                <ChevronDown className="h-4 w-4 text-white/60" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover border-border">
              <DropdownMenuLabel className="font-medium">Minha Conta</DropdownMenuLabel>
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