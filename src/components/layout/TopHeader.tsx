import React, { useState, useEffect } from "react";
import { Bell, ChevronDown, Eye, LogOut, RefreshCw, Settings, Smartphone, User } from "lucide-react";
import logoMarcaCompleta from "@/assets/logo-auth-fundo-escuro.png";
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
import { usePWAInstall } from "@/hooks/usePWAInstall";
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
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const { data: avisosCount } = useAvisosAtivosCount();
  const temAvisos = !!avisosCount && avisosCount > 0;

  /* Instalar o app virou um ícone ao lado do perfil. No iOS não existe
     prompt nativo, então ali a gente manda para a página que ensina. */
  const { canInstall, isInstalled, deviceType, triggerInstall } = usePWAInstall();
  const podeInstalar = !isInstalled && (canInstall || deviceType === "ios");
  const instalarApp = () => {
    if (canInstall) void triggerInstall();
    else navigate("/instalar");
  };

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
        <div className="fixed top-0 left-0 right-0 bg-status-warning text-charcoal text-center py-2 z-[60] text-sm font-medium flex items-center justify-center gap-4">
          <span>
            <Eye className="h-4 w-4 inline mr-1" /> Visualizando como: <strong>
              {`${impersonatedUserName} (${viewAs === 'academy' ? 'Academy' : viewAs === 'insider_business' ? 'Insider Business' : 'Insider Convidado'})`}
            </strong>
          </span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={resetView} 
            className="h-7 px-3 text-charcoal hover:text-charcoal hover:bg-black/10"
          >
            Sair da simulação
          </Button>
        </div>
      )}
      
      <header
        className={cn(
          "fixed z-50 w-full border-b border-chrome-border bg-chrome text-chrome-foreground transition-transform duration-300 ease-in-out",
          isScrolled && !isHovered ? "-translate-y-full" : "translate-y-0",
          isAdmin && isViewingAs ? "top-10" : "top-0"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-14 w-full">
        {/* LEFT: SidebarTrigger + Logo + Mobile Menu */}
        <div className="absolute left-0 top-0 h-full flex items-center gap-2 ml-1 md:ml-2">
          <SidebarTrigger className="h-10 w-10 md:h-8 md:w-8 text-white/80 hover:text-white hover:bg-white/10 bg-white/5 rounded-md transition-colors" />
          <Link to="/" className="hidden sm:block">
            <img
              src={logoMarcaCompleta}
              alt="IAplicada"
              className="h-6 md:h-7 w-auto"
            />
          </Link>

        </div>


        {/* RIGHT: ambiente + instalar + perfil. Tudo que era botão solto
            (atualizar, avisos, modo foco) virou opção dentro do perfil. */}
        <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-4">
          {/* Evita badges duplicados: para Admin mantemos apenas o "Ver como..." */}
          {!isAdmin && <EnvironmentSwitcher />}
          {isAdmin && <AdminViewSelector isAdmin={isAdmin} />}

          {podeInstalar && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={instalarApp}
                    aria-label="Instalar o app"
                  >
                    <Smartphone className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Instalar o app</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative gap-2 h-auto px-2 py-1.5 text-white hover:text-white hover:bg-white/10">
                <Avatar className="h-8 w-8 border border-white/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(user?.email, profile?.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                {temAvisos && (
                  <span className="absolute left-7 top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-chrome" />
                )}
                <span className="hidden md:block text-sm font-medium text-white">
                  {firstName}
                </span>
                <ChevronDown className="h-4 w-4 text-white/60" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
              <DropdownMenuLabel className="font-medium">Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild>
                <Link to="/perfil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notificacoes" className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  Avisos
                  {temAvisos && (
                    <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {avisosCount! > 9 ? "9+" : avisosCount}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/configuracoes" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={forceFullAppReload} className="cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar app
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
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