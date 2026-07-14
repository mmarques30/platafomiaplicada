import React, { useState, useEffect } from "react";
import { Bell, ChevronDown, RefreshCw, Home, BookOpen, Library, Eye, Maximize2, Minimize2 } from "lucide-react";
import logoMarcaCompleta from "@/assets/logo-aplicada-marca-completa.png";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAvisosAtivosCount } from "@/hooks/useAvisosPublicos";
import { useProdutosAtivos } from "@/hooks/admin/useProdutos";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { cn } from "@/lib/utils";
import { forceFullAppReload } from "@/lib/pwaUpdate";
import { AdminViewSelector } from "@/components/admin/AdminViewSelector";
import { EnvironmentSwitcher } from "@/components/layout/EnvironmentSwitcher";

export function TopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin, isParceiro } = useUserRole();
  const { effectivePlan, isBusiness, isSkills, isAcademy, isVisitante, hasEffectiveAccessTo } = useEffectivePlan(isAdmin, false, isParceiro);
  const { profile } = useUserProfile();
  const { data: produtosAtivos } = useProdutosAtivos();
  const { viewAs, impersonatedUserName, resetView, isViewingAs } = useAdminViewContext();
  
  // Verifica se um produto está ativo pelo slug
  const isProdutoAtivo = (slug: string) => {
    return produtosAtivos?.some(p => p.slug === slug) ?? false;
  };
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modoFoco, setModoFoco] = useState(() => sessionStorage.getItem('modo_foco') === 'true');

  const toggleFoco = () => {
    const novo = !modoFoco;
    setModoFoco(novo);
    sessionStorage.setItem('modo_foco', String(novo));
    document.body.classList.toggle('modo-foco', novo);
  };

  // Restaurar classe no body ao montar
  useEffect(() => {
    if (modoFoco) document.body.classList.add('modo-foco');
    return () => document.body.classList.remove('modo-foco');
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isCursosActive = ['/trilhas', '/mentoria', '/lab', '/skills'].some(path => location.pathname.startsWith(path));
  const isComunicacoesActive = ['/chat', '/notificacoes', '/avisos'].some(path => location.pathname.startsWith(path));

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
    <>
      {/* Banner de simulação unificado */}
      {isAdmin && isViewingAs && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-black text-center py-2 z-[60] text-sm font-medium flex items-center justify-center gap-4">
          <span>
            <Eye className="h-4 w-4 inline mr-1" /> Visualizando como: <strong>
              {viewAs === 'visitante' 
                ? 'Visitante' 
                : `${impersonatedUserName} (${viewAs === 'academy' ? 'Academy' : viewAs === 'business_sistemas' ? 'System' : 'Builder'})`
              }
            </strong>
          </span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={resetView} 
            className="h-7 px-3 text-black hover:text-black hover:bg-amber-600"
          >
            Sair da simulação
          </Button>
        </div>
      )}
      
      <header
        className={cn(
          "fixed z-50 w-full border-b border-brand-hairline bg-brand-cream-soft transition-transform duration-300 ease-in-out",
          isScrolled && !isHovered ? "-translate-y-full" : "translate-y-0",
          isAdmin && isViewingAs ? "top-10" : "top-0"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-14 w-full">
        {/* LEFT: SidebarTrigger + Logo + Mobile Menu */}
        <div className="absolute left-0 top-0 h-full flex items-center gap-2 ml-1 md:ml-2">
          <SidebarTrigger className="h-10 w-10 md:h-8 md:w-8 text-foreground hover:text-foreground hover:bg-foreground/10 bg-foreground/5 rounded-md transition-colors" />
          <Link to="/" className="hidden sm:block">
            <img
              src={logoMarcaCompleta}
              alt="IAplicada"
              className="h-6 md:h-7 w-auto"
            />
          </Link>

        </div>

        {/* CENTER: Horizontal Navigation - centralizado na viewport com posição absoluta */}
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-8">
          <NavLink 
            to="/" 
            end
            className={({ isActive }) => cn(
              "text-sm font-medium transition-colors",
              isActive ? "text-brand-strong font-semibold" : "text-foreground/60 hover:text-foreground"
            )}
          >
            Página Inicial
          </NavLink>
          
          {/* Dropdown Cursos - oculto para todos os planos (usam Environment Switcher) */}
          {!isVisitante && !isAcademy && !isSkills && !isBusiness && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm font-medium h-auto p-0 transition-colors hover:bg-transparent",
                    isCursosActive ? "text-brand-strong font-semibold" : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  Cursos
                  <ChevronDown className="ml-1 h-4 w-4" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-popover border-border">
                {/* Academy: sempre visível, é o acesso base para todos os planos */}
                {hasEffectiveAccessTo("trilhas") && (
                  <DropdownMenuItem asChild>
                    <Link to="/trilhas" className="cursor-pointer">
                      Academy
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {/* Builder: só aparece se TEM acesso business */}
                {hasEffectiveAccessTo("business") && isProdutoAtivo("business") && (
                  <DropdownMenuItem asChild>
                    <Link to="/mentoria" className="cursor-pointer">
                      Builder
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Comunicações - visível para Academy, Skills e Business */}
          {!isVisitante && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm font-medium h-auto p-0 transition-colors hover:bg-transparent",
                    isComunicacoesActive ? "text-brand-strong font-semibold" : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  Comunicações
                  <ChevronDown className="ml-1 h-4 w-4" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-popover border-border">
                <DropdownMenuItem asChild>
                  <Link to="/chat" className="cursor-pointer">
                    Chat MarIAna
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notificacoes" className="cursor-pointer">
                    Avisos
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Primeiros passos - reabre o guia de onboarding a qualquer momento */}
          {!isVisitante && (
            <button
              type="button"
              data-tour="primeiros-passos"
              onClick={() => window.dispatchEvent(new CustomEvent("abrir-primeiros-passos"))}
              className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
            >
              Primeiros passos
            </button>
          )}
        </nav>

        {/* RIGHT: Environment Switcher + Admin View Selector + Refresh + Notifications + Avatar */}
        <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-4">
          {/* Evita badges duplicados: para Admin mantemos apenas o "Ver como..." */}
          {!isAdmin && <EnvironmentSwitcher />}
          {isAdmin && <AdminViewSelector isAdmin={isAdmin} />}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hidden md:flex h-9 w-9 transition-colors ${modoFoco ? 'bg-brand-strong/10 text-brand-strong' : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'}`}
                  onClick={toggleFoco}
                >
                  {modoFoco ? <Minimize2 className="h-5 w-5" strokeWidth={1.5} /> : <Maximize2 className="h-5 w-5" strokeWidth={1.5} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{modoFoco ? 'Sair do modo foco' : 'Modo foco'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  onClick={forceFullAppReload}
                >
                  <RefreshCw className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Atualizar app</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
            onClick={() => navigate("/notificacoes")}
          >
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            {avisosCount && avisosCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-strong flex items-center justify-center text-[10px] font-semibold text-brand-strong-foreground">
                {avisosCount > 9 ? "9+" : avisosCount}
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-auto px-2 py-1.5 hover:bg-foreground/5">
                <Avatar className="h-8 w-8 border border-brand-hairline">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(user?.email, profile?.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {firstName}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
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
              <DropdownMenuItem onClick={forceFullAppReload} className="cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar app
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
    </>
  );
}