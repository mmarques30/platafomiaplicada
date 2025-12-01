import { useState, useEffect } from "react";
import { Home, BookOpen, Star, Bell, Settings, LogOut, MessageSquare, Shield, TrendingUp, GraduationCap, Layers, ChevronDown, Zap } from "lucide-react";
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
import logoSimbolo from "@/assets/logo-aplicada-simbolo.png";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import * as LucideIcons from "lucide-react";

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isMentorado, isVisitante } = useUserRole();
  const { plan } = useUserPlan();
  const { signOut } = useAuth();
  const { getSidebarMenus, isLoading: menuLoading } = useMenuConfig();
  console.log("[AppSidebar] isAdmin:", isAdmin);
  console.log("[AppSidebar] isMentorado:", isMentorado);
  const collapsed = !open;
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Home;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Home;
  };

  const sidebarMenus = getSidebarMenus(plan);
  
  // Separar menus principais e subitens
  const allMainMenus = sidebarMenus.filter(menu => !menu.parent_key);
  
  // Filtrar menus para visitantes (apenas Trilhas e Comunidade)
  const mainMenus = isVisitante 
    ? allMainMenus.filter(menu => ['trilhas', 'comunidade'].includes(menu.menu_key))
    : allMainMenus;
  
  const getSubMenus = (parentKey: string) => 
    sidebarMenus.filter(menu => menu.parent_key === parentKey);

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuKey) 
        ? prev.filter(k => k !== menuKey) 
        : [...prev, menuKey]
    );
  };

  // Auto-expandir se estiver em rota de submenu
  useEffect(() => {
    mainMenus.forEach(menu => {
      const subMenus = getSubMenus(menu.menu_key);
      const isInSubRoute = subMenus.some(sub => location.pathname === sub.url);
      if (isInSubRoute && !expandedMenus.includes(menu.menu_key)) {
        setExpandedMenus(prev => [...prev, menu.menu_key]);
      }
    });
  }, [location.pathname]);


  return (
    <Sidebar className="border-r border-border bg-background/50 backdrop-blur-sm">
      <SidebarHeader>
        <div className="flex h-16 items-center justify-center px-4 bg-gradient-to-br from-primary/5 to-transparent">
          <img src={logoSimbolo} alt="IAplicada" className="h-12 w-12 drop-shadow-md" />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {!menuLoading && mainMenus.map((menu) => {
                const isActive = location.pathname === menu.url;
                const IconComponent = getIconComponent(menu.icon);
                const subMenus = getSubMenus(menu.menu_key);
                const hasSubMenus = subMenus.length > 0;
                const isExpanded = expandedMenus.includes(menu.menu_key);
                
                if (hasSubMenus) {
                  return (
                    <Collapsible 
                      key={menu.menu_key} 
                      open={isExpanded}
                      onOpenChange={() => toggleMenu(menu.menu_key)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center w-full">
                            {/* Parte clicável que navega */}
                            <NavLink
                              to={menu.url || "/"}
                              className={cn(
                                "group relative rounded-lg transition-all duration-200 font-medium pl-4 flex-1 flex items-center gap-3 py-2",
                                isActive ? "text-primary font-semibold" : "text-foreground hover:text-primary"
                              )}
                            >
                              <span className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                                isActive 
                                  ? "bg-aplicada-green-700 opacity-100" 
                                  : "bg-aplicada-green-400 opacity-0 group-hover:opacity-60"
                              )} />
                              <IconComponent className="h-4 w-4 shrink-0" />
                              {!collapsed && <span>{menu.label}</span>}
                            </NavLink>
                            {/* Botão do chevron que expande/colapsa */}
                            {!collapsed && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleMenu(menu.menu_key);
                                }}
                                className="p-2 hover:bg-accent rounded-lg transition-colors"
                              >
                                <ChevronDown 
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isExpanded && "rotate-180"
                                  )} 
                                />
                              </button>
                            )}
                          </div>
                        </CollapsibleTrigger>
                      </SidebarMenuItem>
                      
                      <CollapsibleContent>
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
                                    "relative rounded-lg transition-all duration-200 font-medium pl-8",
                                    subIsActive 
                                      ? "text-primary font-semibold" 
                                      : "text-foreground hover:text-primary"
                                  )}
                                >
                                  <span className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                                    subIsActive 
                                      ? "bg-aplicada-green-700 opacity-100" 
                                      : "bg-aplicada-green-400 opacity-0 group-hover:opacity-60"
                                  )} />
                                  {SubIconComponent && <SubIconComponent className="h-4 w-4 shrink-0" />}
                                  {!collapsed && <span>{subMenu.label}</span>}
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={menu.menu_key}>
                    <SidebarMenuButton asChild className="group">
                      <NavLink 
                        to={menu.url || "/"} 
                        end 
                        className={cn(
                          "relative rounded-lg transition-all duration-200 font-medium pl-4",
                          isActive 
                            ? "text-primary font-semibold" 
                            : "text-foreground hover:text-primary"
                        )}
                      >
                        <span className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                          isActive 
                            ? "bg-aplicada-green-700 opacity-100" 
                            : "bg-aplicada-green-400 opacity-0 group-hover:opacity-60"
                        )} />
                        <IconComponent className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{menu.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Vídeos Bônus - Exclusivo para Visitantes (item independente) */}
              {isVisitante && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="group">
                    <NavLink 
                      to="/videos-bonus" 
                      end 
                      className={cn(
                        "relative rounded-lg transition-all duration-200 font-medium pl-4",
                        location.pathname === '/videos-bonus'
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      )}
                    >
                      <span className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                        location.pathname === '/videos-bonus'
                          ? "bg-aplicada-green-700 opacity-100" 
                          : "bg-aplicada-green-400 opacity-0 group-hover:opacity-60"
                      )} />
                      <LucideIcons.Gift className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Vídeos Bônus</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Materiais - Exclusivo para Visitantes */}
              {isVisitante && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="group">
                    <NavLink 
                      to="/materiais-gratuitos"
                      end
                      className={cn(
                        "relative rounded-lg transition-all duration-200 font-medium pl-4",
                        location.pathname === "/materiais-gratuitos"
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      )}
                    >
                      <span className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                        location.pathname === "/materiais-gratuitos"
                          ? "bg-aplicada-green-700 opacity-100" 
                          : "bg-aplicada-green-400 opacity-0 group-hover:opacity-60"
                      )} />
                      <LucideIcons.FileText className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Materiais</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* CTA Item */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="group">
                <NavLink 
                  to={isVisitante || !plan ? "/aplique" : "/avance"}
                  end
                  className={cn(
                    "relative rounded-lg transition-all duration-200 font-medium pl-4",
                    location.pathname === (isVisitante || !plan ? "/aplique" : "/avance")
                      ? "text-red-600 font-semibold bg-red-50 dark:bg-red-950/30" 
                      : "text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                    location.pathname === (isVisitante || !plan ? "/aplique" : "/avance")
                      ? "bg-red-600 opacity-100" 
                      : "bg-red-400 opacity-0 group-hover:opacity-60"
                  )} />
                  <Zap className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{isVisitante || !plan ? "Aplique" : "Avance"}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="group">
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => cn(
                        "relative rounded-lg transition-all duration-200 font-medium pl-4",
                        isActive 
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      )}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                            isActive 
                              ? "bg-aplicada-green-700 opacity-100" 
                              : "bg-aplicada-green-400 opacity-0 group-hover:opacity-60"
                          )} />
                          <Shield className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>Painel Admin</span>}
                        </>
                      )}
                    </NavLink>
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
                  "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium pl-4",
                  isActive ? "text-primary font-semibold" : "text-foreground hover:text-primary"
                )}
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                      isActive 
                        ? "bg-aplicada-green-700 opacity-100" 
                        : "bg-aplicada-green-400 opacity-0 group-hover:opacity-60"
                    )} />
                    <Settings className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Configurações</span>}
                  </>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
