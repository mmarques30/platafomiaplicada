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
  
  const allMainMenus = sidebarMenus.filter(menu => !menu.parent_key);
  
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
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader>
        <div className="flex h-16 items-center justify-center px-4">
          <img src={logoSimbolo} alt="IAplicada" className="h-10 w-10" />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
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
                            <NavLink
                              to={menu.url || "/"}
                              className={cn(
                                "group relative rounded-lg transition-all duration-200 font-medium pl-4 flex-1 flex items-center gap-3 py-2.5",
                                isActive 
                                  ? "text-sidebar-primary font-semibold" 
                                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                              )}
                            >
                              <span className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                                isActive 
                                  ? "bg-sidebar-active opacity-100" 
                                  : "bg-sidebar-active/30 opacity-0 group-hover:opacity-50"
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
                                    "relative rounded-lg transition-all duration-200 font-medium pl-10 py-2",
                                    subIsActive 
                                      ? "text-sidebar-primary font-semibold" 
                                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                                  )}
                                >
                                  <span className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full transition-all duration-200",
                                    subIsActive 
                                      ? "bg-sidebar-active opacity-100" 
                                      : "bg-sidebar-active/30 opacity-0 group-hover:opacity-50"
                                  )} />
                                  {SubIconComponent && <SubIconComponent className="h-4 w-4 shrink-0" strokeWidth={1.5} />}
                                  {!collapsed && <span className="text-sm">{subMenu.label}</span>}
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
                          "relative rounded-lg transition-all duration-200 font-medium pl-4 py-2.5",
                          isActive 
                            ? "text-sidebar-primary font-semibold" 
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        )}
                      >
                        <span className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                          isActive 
                            ? "bg-sidebar-active opacity-100" 
                            : "bg-sidebar-active/30 opacity-0 group-hover:opacity-50"
                        )} />
                        <IconComponent className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        {!collapsed && <span className="text-sm">{menu.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Vídeos Bônus - Visitantes only */}
              {isVisitante && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="group">
                    <NavLink 
                      to="/videos-bonus" 
                      end 
                      className={cn(
                        "relative rounded-lg transition-all duration-200 font-medium pl-4 py-2.5",
                        location.pathname === '/videos-bonus'
                          ? "text-sidebar-primary font-semibold" 
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      )}
                    >
                      <span className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                        location.pathname === '/videos-bonus'
                          ? "bg-sidebar-active opacity-100" 
                          : "bg-sidebar-active/30 opacity-0 group-hover:opacity-50"
                      )} />
                      <LucideIcons.Gift className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {!collapsed && <span className="text-sm">Vídeos Bônus</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Materiais - Visitantes only */}
              {isVisitante && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="group">
                    <NavLink 
                      to="/materiais-gratuitos"
                      end
                      className={cn(
                        "relative rounded-lg transition-all duration-200 font-medium pl-4 py-2.5",
                        location.pathname === "/materiais-gratuitos"
                          ? "text-sidebar-primary font-semibold" 
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      )}
                    >
                      <span className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                        location.pathname === "/materiais-gratuitos"
                          ? "bg-sidebar-active opacity-100" 
                          : "bg-sidebar-active/30 opacity-0 group-hover:opacity-50"
                      )} />
                      <LucideIcons.FileText className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {!collapsed && <span className="text-sm">Materiais</span>}
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
                      "relative rounded-lg transition-all duration-200 font-medium pl-4 py-2.5",
                      location.pathname === (isVisitante || !plan ? "/aplique" : "/avance")
                        ? "text-red-500 font-semibold bg-red-500/10" 
                        : "text-red-500/80 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10"
                    )}
                  >
                    <span className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                      location.pathname === (isVisitante || !plan ? "/aplique" : "/avance")
                        ? "bg-red-500 opacity-100" 
                        : "bg-red-400/50 opacity-0 group-hover:opacity-60"
                    )} />
                    <Zap className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {!collapsed && <span className="text-sm">{isVisitante || !plan ? "Aplique" : "Avance"}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
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
                          ? "text-sidebar-primary font-semibold" 
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      )}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                            isActive 
                              ? "bg-sidebar-active opacity-100" 
                              : "bg-sidebar-active/30 opacity-0 group-hover:opacity-50"
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
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="group">
              <NavLink 
                to="/configuracoes" 
                className={({ isActive }) => cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium pl-4",
                  isActive ? "text-sidebar-primary font-semibold" : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                )}
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                      isActive 
                        ? "bg-sidebar-active opacity-100" 
                        : "bg-sidebar-active/30 opacity-0 group-hover:opacity-50"
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