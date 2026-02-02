import { useState, useEffect } from "react";
import { Home, BookOpen, Star, Bell, Settings, LogOut, MessageSquare, Shield, TrendingUp, GraduationCap, Layers, ChevronDown, EyeOff } from "lucide-react";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
// Usar caminho estático para garantir carregamento no PWA
const logoSimbolo = "/logo-simbolo.png?v=10";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import * as LucideIcons from "lucide-react";

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isMentorado, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isVisitante, isBusiness, isSkills, isAcademy, isLoading: effectivePlanLoading } = useEffectivePlan(isAdmin, roleLoading);
  const { isViewingAs, resetView } = useAdminViewContext();
  const { signOut } = useAuth();
  const { getSidebarMenus, isLoading: menuLoading } = useMenuConfig();
  const { isLider: isSkillsLider } = useSkillsMembro();
  const { currentEnvironment } = useEnvironment();
  
  // Menus a ocultar quando em ambiente específico (Skills/Business têm acesso separado ao Academy)
  const getEnvironmentHiddenMenus = (environment: string | null): string[] => {
    switch (environment) {
      case 'skills':
        return ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'];
      case 'business':
        return ['trilhas', 'calendario'];
      default:
        return [];
    }
  };
  const collapsed = !open;
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [logoError, setLogoError] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Home;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Home;
  };

  const sidebarMenus = getSidebarMenus(effectivePlan);
  
  // Pegar todos os menus principais (sem parent_key)
  // Excluir "Comunicações" (interacoes) do sidebar - agora está no menu superior
  const allMainMenus = sidebarMenus.filter(menu => !menu.parent_key && menu.menu_key !== 'interacoes');
  
  // Filtrar para visitantes: apenas início (sem submenus expansíveis)
  // Enquanto loading, não filtra como visitante para evitar flicker
  const isLoadingState = roleLoading || effectivePlanLoading;
  const mainMenus = (!isLoadingState && isVisitante)
    ? allMainMenus.filter(menu => menu.menu_key === 'inicio')
    : allMainMenus;
  
  // Obter submenus de um parent
  const getSubMenus = (parentKey: string) => {
    // Visitantes têm submenus específicos para "início"
    if (!isLoadingState && isVisitante) {
      if (parentKey === 'inicio') {
        return [
          { menu_key: 'inicio_central', label: 'Central', url: '/central', icon: null, parent_key: 'inicio' },
        ] as any[];
      }
      return [];
    }
    
    // Obter menus a ocultar baseado no ambiente selecionado
    const hiddenMenus = getEnvironmentHiddenMenus(currentEnvironment);
    
    // Filtrar menu "Painel do Líder" se não for líder Skills + filtrar por ambiente
    return sidebarMenus
      .filter(menu => menu.parent_key === parentKey)
      .filter(menu => !hiddenMenus.includes(menu.menu_key))
      .filter(menu => menu.menu_key !== 'skills_lider' || isSkillsLider);
  };

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(k => k !== menuKey) 
        : [...prev, menuKey]
    );
  };

  // Helper para determinar URL dinâmica baseada no plano
  const getMenuUrl = (menu: { menu_key: string; url: string | null }) => {
    if (menu.menu_key === 'meu_progresso') {
      // Business vai para /mentoria (Visão Geral), demais para /evolucao
      return effectivePlan === 'business' ? '/mentoria' : '/evolucao';
    }
    return menu.url || "/";
  };

  // Auto-expandir menu quando rota ativa está em submenu
  useEffect(() => {
    const newExpanded: string[] = [];
    mainMenus.forEach(menu => {
      const subMenus = getSubMenus(menu.menu_key);
      const isInSubRoute = subMenus.some(sub => 
        sub.url && location.pathname.startsWith(sub.url)
      );
      if (isInSubRoute) {
        newExpanded.push(menu.menu_key);
      }
    });
    if (newExpanded.length > 0) {
      setExpandedMenus(prev => {
        const combined = [...new Set([...prev, ...newExpanded])];
        return combined;
      });
    }
  }, [location.pathname]);

  return (
    <Sidebar className={cn(
      "border-r border-sidebar-border bg-sidebar",
      isViewingAs ? "pt-24" : "pt-14"
    )}>
      <SidebarContent className="pt-2 pb-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {mainMenus.map((menu, index) => {
                const isActive = location.pathname === menu.url;
                const IconComponent = getIconComponent(menu.icon);
                const subMenus = getSubMenus(menu.menu_key);
                const hasSubMenus = subMenus.length > 0;
                const isExpanded = expandedMenus.includes(menu.menu_key);
                
                // Renderizar Bibliotecas logo após "Aprender" (menu_key === 'aprender')
                const renderBibliotecasAfter = menu.menu_key === 'aprender';
                
                const menuElement = hasSubMenus ? (
                  <Collapsible 
                    key={menu.menu_key} 
                    open={isExpanded}
                    onOpenChange={() => toggleMenu(menu.menu_key)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center w-full">
                          <NavLink
                            to={getMenuUrl(menu)}
                          className={cn(
                            "group relative rounded-lg transition-all duration-200 font-medium pl-4 flex-1 flex items-center gap-3 py-2.5",
                            isActive 
                              ? "text-primary font-semibold" 
                              : "text-sidebar-foreground hover:text-primary"
                          )}
                        >
                          <span className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                            isActive 
                              ? "bg-[#0D0D0D] opacity-100" 
                              : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                          )} />
                            <IconComponent className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                            {!collapsed && <span className="text-sm">{menu.label}</span>}
                          </NavLink>
                          {!collapsed && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleMenu(menu.menu_key);
                              }}
                              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
                            >
                              <ChevronDown 
                                className={cn(
                                  "h-4 w-4 transition-transform duration-200 text-sidebar-foreground/60",
                                  isExpanded && "rotate-180"
                                )} 
                                strokeWidth={1.5}
                              />
                            </button>
                          )}
                        </div>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>
                    
                    <CollapsibleContent>
                      <SidebarMenu className="ml-4 mt-1 border-l border-border pl-2">
                        {subMenus.map((subMenu) => {
                          const subIsActive = location.pathname === subMenu.url;
                          const SubIconComponent = subMenu.icon ? getIconComponent(subMenu.icon) : null;
                          
                          return (
                            <SidebarMenuItem key={subMenu.menu_key}>
                              <SidebarMenuButton asChild className="group">
                                <NavLink 
                                  to={subMenu.url || "/"} 
                                  end 
                                  className={cn(
                                    "rounded-lg transition-all duration-200 font-medium pl-2 py-2 text-sm",
                                    subIsActive 
                                      ? "text-primary font-semibold" 
                                      : "text-sidebar-foreground/70 hover:text-primary"
                                  )}
                                >
                                  {!collapsed && <span>{subMenu.label}</span>}
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={menu.menu_key}>
                    <SidebarMenuButton asChild className="group">
                      <NavLink 
                        to={menu.url || "/"} 
                        end 
                        className={cn(
                          "relative rounded-lg transition-all duration-200 font-medium pl-4 py-2.5",
                          isActive 
                            ? "text-primary font-semibold" 
                            : "text-sidebar-foreground hover:text-primary"
                        )}
                      >
                        <span className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                          isActive 
                            ? "bg-[#0D0D0D] opacity-100" 
                            : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                        )} />
                        <IconComponent className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        {!collapsed && <span className="text-sm">{menu.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );

                // Renderizar Bibliotecas imediatamente após "Aprender"
                const bibliotecasMenu = renderBibliotecasAfter && !isVisitante ? (
                  <Collapsible 
                    key="bibliotecas_menu"
                    open={expandedMenus.includes('bibliotecas_menu')} 
                    onOpenChange={() => toggleMenu('bibliotecas_menu')}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="group w-full relative">
                          <span className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                            ['/ia-copie-use', '/biblioteca-ferramentas', '/biblioteca-prompts', '/metodos-aplicar'].some(p => location.pathname.startsWith(p))
                              ? "bg-[#0D0D0D] opacity-100" 
                              : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                          )} />
                          <div className={cn(
                            "flex items-center gap-2 rounded-lg transition-all duration-200 font-medium pl-4 py-2.5 w-full",
                            ['/ia-copie-use', '/biblioteca-ferramentas', '/biblioteca-prompts', '/metodos-aplicar'].some(p => location.pathname.startsWith(p))
                              ? "text-primary font-semibold" 
                              : "text-sidebar-foreground hover:text-primary"
                          )}>
                            <LucideIcons.Library className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                            {!collapsed && (
                              <>
                                <span className="text-sm flex-1 text-left">Bibliotecas</span>
                                <LucideIcons.ChevronDown className={cn(
                                  "h-4 w-4 transition-transform duration-200",
                                  expandedMenus.includes('bibliotecas_menu') && "rotate-180"
                                )} />
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <SidebarMenu className="ml-4 mt-1 border-l border-border pl-2">
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild className="group">
                              <NavLink 
                                to="/ia-copie-use" 
                                end
                                className={cn(
                                  "rounded-lg transition-all duration-200 font-medium pl-2 py-2 text-sm",
                                  location.pathname === '/ia-copie-use'
                                    ? "text-primary font-semibold" 
                                    : "text-sidebar-foreground/70 hover:text-primary"
                                )}
                              >
                                {!collapsed && <span>IA "Copie e Use"</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild className="group">
                              <NavLink 
                                to="/biblioteca-ferramentas" 
                                end
                                className={cn(
                                  "rounded-lg transition-all duration-200 font-medium pl-2 py-2 text-sm",
                                  location.pathname === '/biblioteca-ferramentas'
                                    ? "text-primary font-semibold" 
                                    : "text-sidebar-foreground/70 hover:text-primary"
                                )}
                              >
                                {!collapsed && <span>Ferramentas</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild className="group">
                              <NavLink 
                                to="/biblioteca-prompts" 
                                end
                                className={cn(
                                  "rounded-lg transition-all duration-200 font-medium pl-2 py-2 text-sm",
                                  location.pathname === '/biblioteca-prompts'
                                    ? "text-primary font-semibold" 
                                    : "text-sidebar-foreground/70 hover:text-primary"
                                )}
                              >
                                {!collapsed && <span>Prompts</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild className="group">
                              <NavLink 
                                to="/metodos-aplicar" 
                                end
                                className={cn(
                                  "rounded-lg transition-all duration-200 font-medium pl-2 py-2 text-sm",
                                  location.pathname === '/metodos-aplicar'
                                    ? "text-primary font-semibold" 
                                    : "text-sidebar-foreground/70 hover:text-primary"
                                )}
                              >
                                {!collapsed && <span>Métodos</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : null;

                return (
                  <>
                    {menuElement}
                    {bibliotecasMenu}
                  </>
                );
              })}

              {/* Comunidade - Menu expansível (oculto para Business) */}
              {!isBusiness && (
                <Collapsible 
                  open={expandedMenus.includes('comunidade_menu')} 
                  onOpenChange={() => toggleMenu('comunidade_menu')}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="group w-full relative">
                        <span className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                          (location.pathname === '/comunidade' || location.pathname === '/videos-bonus')
                            ? "bg-[#0D0D0D] opacity-100" 
                            : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                        )} />
                        <div className={cn(
                          "flex items-center gap-2 rounded-lg transition-all duration-200 font-medium pl-4 py-2.5 w-full",
                          (location.pathname === '/comunidade' || location.pathname === '/videos-bonus')
                            ? "text-primary font-semibold" 
                            : "text-sidebar-foreground hover:text-primary"
                        )}>
                          <LucideIcons.Users className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                          {!collapsed && (
                            <>
                              <span className="text-sm flex-1 text-left">Comunidade</span>
                              <LucideIcons.ChevronDown className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                expandedMenus.includes('comunidade_menu') && "rotate-180"
                              )} />
                            </>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <SidebarMenu className="ml-4 mt-1 border-l border-border pl-2">
                        {/* Feed */}
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className="group">
                            <NavLink 
                              to="/comunidade" 
                              end
                              className={cn(
                                "rounded-lg transition-all duration-200 font-medium pl-2 py-2 text-sm",
                                location.pathname === '/comunidade'
                                  ? "text-primary font-semibold" 
                                  : "text-sidebar-foreground/70 hover:text-primary"
                              )}
                            >
                              {!collapsed && <span>Feed</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        {/* Sala de Aula - oculto para Academy */}
                        {!isAcademy && (
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild className="group">
                              <NavLink 
                                to="/videos-bonus" 
                                end
                                className={cn(
                                  "rounded-lg transition-all duration-200 font-medium pl-2 py-2 text-sm",
                                  location.pathname === '/videos-bonus'
                                    ? "text-primary font-semibold" 
                                    : "text-sidebar-foreground/70 hover:text-primary"
                                )}
                              >
                                {!collapsed && <span>Sala de Aula</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Menu Cupons - Apenas visitantes (após Comunidade) */}
              {isVisitante && !isLoadingState && (
                <SidebarMenuItem>
                  <NavLink 
                    to="/cupons" 
                    end 
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200 font-semibold",
                      "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center",
                      isActive 
                        ? "bg-aplicada-green-700 text-black" 
                        : "text-aplicada-green-700 hover:bg-aplicada-green-700/10"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <LucideIcons.Ticket 
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-black" : "text-aplicada-green-700"
                          )} 
                          strokeWidth={1.5} 
                        />
                        {!collapsed && (
                          <span className={cn(
                            "text-sm",
                            isActive ? "text-black" : "text-aplicada-green-700"
                          )}>
                            Cupons
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              )}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && !isViewingAs && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-3">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="group">
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => cn(
                        "relative rounded-lg transition-all duration-200 font-medium pl-4 py-2.5",
                        isActive 
                          ? "text-primary font-semibold" 
                          : "text-sidebar-foreground hover:text-primary"
                      )}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                            isActive 
                              ? "bg-[#0D0D0D] opacity-100" 
                              : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                          )} />
                          <Shield className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                          {!collapsed && <span className="text-sm">Painel Admin</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && isViewingAs && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-3">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={resetView}
                    className="group relative rounded-lg transition-all duration-200 font-medium pl-4 py-2.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <EyeOff className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {!collapsed && <span className="text-sm">Sair da Simulação</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="group">
              <NavLink 
                to="/configuracoes" 
                className={({ isActive }) => cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium pl-4",
                  isActive ? "text-primary font-semibold" : "text-sidebar-foreground hover:text-primary"
                )}
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                      isActive 
                        ? "bg-[#0D0D0D] opacity-100" 
                        : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                    )} />
                    <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {!collapsed && <span className="text-sm">Configurações</span>}
                  </>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 py-2.5">
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span className="text-sm">Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}