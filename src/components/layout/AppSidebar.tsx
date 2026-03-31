import { useState, useEffect } from "react";
import { Home, BookOpen, Star, Bell, Settings, LogOut, MessageSquare, Shield, TrendingUp, GraduationCap, Layers, ChevronDown, EyeOff, Route, Package, Calendar, ListChecks, CheckSquare, ClipboardCheck, FileText, FolderOpen, HelpCircle, BarChart3, Wrench } from "lucide-react";
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
import logoSimbolo from "@/assets/logo-aplicada-simbolo.png";
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
  const { isAdmin, isMentorado, isParceiro, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isVisitante, isBusiness, isSkills, isAcademy, isLoading: effectivePlanLoading } = useEffectivePlan(isAdmin, roleLoading, isParceiro);
  const { isViewingAs, resetView, viewAs } = useAdminViewContext();
  const { signOut } = useAuth();
  const { getSidebarMenus, isMenuVisible, isLoading: menuLoading } = useMenuConfig();
  const { isLider: isSkillsLider, isLoading: skillsMembroLoading } = useSkillsMembro();
  const { currentEnvironment } = useEnvironment();
  
  const collapsed = !open;
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'biz_jornada', 'biz_entregas', 'biz_comunicacao' // Business groups default expanded
  ]);
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

  // Em modo simulação, o EnvironmentSwitcher fica oculto; então garantimos que o filtro de menus
  // acompanhe o plano simulado (evita cenário: ambiente "business" ocultando submenus de academy/skills).
  // Para usuários reais: se o plano é business_sistemas, forçamos esse ambiente.
  const effectiveEnvironment = (() => {
    if (!isViewingAs) {
      // Usuário real: se plano é business_sistemas, usar esse ambiente
      if (effectivePlan === 'business_sistemas') {
        return 'business_sistemas';
      }
      // Fallback: se nenhum ambiente selecionado, inferir do plano
      if (!currentEnvironment) {
        if (effectivePlan === 'skills') return 'skills';
        if (effectivePlan === 'business_parceria') return 'business_parceria';
        if (effectivePlan === 'academy') return 'academy';
        if (isVisitante) return 'gratuito';
        return null;
      }
      return currentEnvironment;
    }

    // Simulação: manter lógica existente
    switch (viewAs) {
      case "visitante":
        return "gratuito";
      case "academy":
        return "academy";
      case "skills":
        return "skills";
      case "business_parceria":
        return "business_parceria";
      case "business_sistemas":
        return "business_sistemas";
      default:
        return currentEnvironment;
    }
  })();

  const sidebarMenus = getSidebarMenus(effectivePlan, effectiveEnvironment);
  
  // Detectar se é Business Sistemas (para filtros especiais)
  const isBusinessSistemasEnv = effectiveEnvironment === 'business_sistemas' 
    || effectivePlan === 'business_sistemas';
  const isBusinessParceriaEnv = effectiveEnvironment === 'business_parceria'
    || effectivePlan === 'business_parceria';
  const isBusinessEnv = isBusinessSistemasEnv || isBusinessParceriaEnv || isBusiness;

  // ========== BUSINESS GROUPS (hardcoded) — START ==========
  // Estes grupos têm prioridade sobre menu_config para Business.
  // Se adicionar rotas aqui, ocultar no hiddenByEnvironment do useMenuConfig.
  const businessGroups = [
    {
      key: 'biz_jornada',
      label: 'MINHA JORNADA',
      icon: Route,
      items: [
        { label: 'Etapas', url: '/mentoria/etapas-business', parceria: true, sistemas: true },
        { label: 'Roadmap', url: '/mentoria?tab=roadmap', parceria: true, sistemas: false },
        { label: 'Instruções', url: '/mentoria/instrucoes-business', parceria: true, sistemas: false },
      ],
    },
    {
      key: 'biz_entregas',
      label: 'ENTREGAS E TAREFAS',
      icon: Package,
      items: [
        { label: 'Entregas', url: '/mentoria/entregas', parceria: true, sistemas: true },
        { label: 'Tarefas', url: '/mentoria/tarefas', parceria: true, sistemas: false },
        { label: 'Tasks', url: '/mentoria/tasks-business', parceria: true, sistemas: false },
        { label: 'Validações', url: '/mentoria/validacoes', parceria: true, sistemas: true },
        { label: 'Projetos', url: '/mentoria/projetos', parceria: true, sistemas: false },
      ],
    },
    {
      key: 'biz_comunicacao',
      label: 'COMUNICAÇÃO',
      icon: MessageSquare,
      items: [
        { label: 'Sessões', url: '/mentoria/sessoes', parceria: true, sistemas: true },
        { label: 'Dúvidas', url: '/mentoria/duvidas', parceria: true, sistemas: false },
        { label: 'Documentos', url: '/mentoria/documentos', parceria: true, sistemas: true },
        { label: 'Recursos', url: '/mentoria/recursos', parceria: true, sistemas: false },
        { label: 'Reports', url: '/mentoria/reports', parceria: true, sistemas: true },
      ],
    },
  ];
  
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
    
    // Filtrar menu "Painel do Líder" se não for líder Skills (e não for admin)
    // Filtrar Performance e Diagnóstico do Projeto Skills para não-líderes/não-admins
    const BIBLIOTECAS_KEYS = ['bibliotecas', 'biblioteca_ferramentas', 'biblioteca_prompts', 'ia_copie_use', 'metodos_aplicar'];
    return sidebarMenus
      .filter(menu => menu.parent_key === parentKey)
      .filter(menu => !BIBLIOTECAS_KEYS.includes(menu.menu_key))
      .filter(menu => !['skills_lider', 'skills_painel_lider'].includes(menu.menu_key) || isSkillsLider || (isAdmin && !isViewingAs) || skillsMembroLoading)
      .filter(menu => !['projeto_skills_performance'].includes(menu.menu_key) || isSkillsLider || (isAdmin && !isViewingAs) || skillsMembroLoading);
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
      // Skills vai para /skills/equipe (Minha Equipe)
      if (effectivePlan === 'skills' || effectiveEnvironment === 'skills') {
        return '/skills/equipe';
      }
      // Business vai para /mentoria (Visão Geral)
      if (effectivePlan === 'business_parceria' || effectivePlan === 'business_sistemas') {
        return '/mentoria';
      }
      // Demais (Academy) vai para /evolucao
      return '/evolucao';
    }
    // Grupo sem URL (ex: meu_sistema): redireciona para primeiro filho
    if (!menu.url) {
      const children = sidebarMenus.filter(m => m.parent_key === menu.menu_key);
      if (children.length > 0 && children[0].url) return children[0].url;
    }
    return menu.url || "/";
  };

  // Auto-expandir menu quando rota ativa está em submenu (incluindo 3º nível e business groups)
  useEffect(() => {
    const newExpanded: string[] = [];
    mainMenus.forEach(menu => {
      const subMenus = getSubMenus(menu.menu_key);
      const isInSubRoute = subMenus.some(sub => {
        if (sub.url && location.pathname.startsWith(sub.url)) return true;
        const thirdLevel = getSubMenus(sub.menu_key);
        return thirdLevel.some(child => child.url && location.pathname.startsWith(child.url));
      });
      if (isInSubRoute) {
        newExpanded.push(menu.menu_key);
      }
    });
    // Auto-expand business groups based on active route
    if (isBusinessEnv) {
      businessGroups.forEach(group => {
        const hasActive = group.items.some(item => {
          const itemPath = item.url.split('?')[0];
          return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
        });
        if (hasActive) newExpanded.push(group.key);
      });
    }
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
                          
                          // Check for 3rd-level children (e.g. Painel Líder under Visão Geral)
                          const thirdLevelMenus = getSubMenus(subMenu.menu_key);
                          
                          if (thirdLevelMenus.length > 0) {
                            const hasActiveChild = thirdLevelMenus.some(child => child.url && location.pathname.startsWith(child.url));
                            return (
                              <Collapsible key={subMenu.menu_key} defaultOpen={hasActiveChild || subIsActive}>
                                <div className="flex items-center">
                                  <SidebarMenuItem className="flex-1">
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
                                  {!collapsed && (
                                    <CollapsibleTrigger asChild>
                                      <button className="p-1 rounded hover:bg-muted/50 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
                                        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 [[data-state=open]>button>&]:rotate-180" />
                                      </button>
                                    </CollapsibleTrigger>
                                  )}
                                </div>
                                <CollapsibleContent>
                                  {thirdLevelMenus.map((child) => {
                                    const childIsActive = location.pathname === child.url;
                                    return (
                                      <SidebarMenuItem key={child.menu_key}>
                                        <SidebarMenuButton asChild className="group">
                                          <NavLink 
                                            to={child.url || "/"} 
                                            end 
                                            className={cn(
                                              "rounded-lg transition-all duration-200 font-medium pl-6 py-2 text-sm",
                                              childIsActive 
                                                ? "text-primary font-semibold" 
                                                : "text-sidebar-foreground/70 hover:text-primary"
                                            )}
                                          >
                                            {!collapsed && <span>{child.label}</span>}
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
                        to={getMenuUrl(menu)} 
                        data-tour={
                          getMenuUrl(menu).includes('calendario') ? 'calendario' :
                          getMenuUrl(menu).includes('evolucao') ? 'evolucao' :
                          undefined
                        }
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
                // Para IAplicada: apenas Prompts e Ferramentas
                const bibliotecasMenu = renderBibliotecasAfter && !isVisitante && isMenuVisible('bibliotecas') ? (
                  <Collapsible 
                    key="bibliotecas_menu"
                    open={expandedMenus.includes('bibliotecas_menu')} 
                    onOpenChange={() => toggleMenu('bibliotecas_menu')}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="group w-full relative pl-4">
                          <span className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                            ['/ia-copie-use', '/biblioteca-ferramentas', '/biblioteca-prompts', '/metodos-aplicar'].some(p => location.pathname.startsWith(p))
                              ? "bg-[#0D0D0D] opacity-100" 
                              : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                          )} />
                          <div className={cn(
                            "flex items-center gap-3 rounded-lg transition-all duration-200 font-medium py-2.5 w-full",
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
                          {isMenuVisible('biblioteca_prompts') && (
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
                          )}
                          {isMenuVisible('biblioteca_ferramentas') && (
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
                          )}
                          {!isBusinessSistemasEnv && isMenuVisible('ia_copie_use') && (
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
                          )}
                          {!isBusinessSistemasEnv && isMenuVisible('metodos_aplicar') && (
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
                          )}
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

              {/* Business Groups - 3 collapsible sections */}
              {isBusinessEnv && businessGroups.map((group) => {
                const GroupIcon = group.icon;
                const filteredItems = group.items.filter(item => 
                  isBusinessSistemasEnv ? item.sistemas : item.parceria
                );
                if (filteredItems.length === 0) return null;
                const isGroupExpanded = expandedMenus.includes(group.key);
                const hasActiveItem = filteredItems.some(item => {
                  const itemPath = item.url.split('?')[0];
                  return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
                });

                return (
                  <Collapsible
                    key={group.key}
                    open={isGroupExpanded}
                    onOpenChange={() => toggleMenu(group.key)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="group w-full pl-4">
                          <div className={cn(
                            "flex items-center gap-3 rounded-lg transition-all duration-200 py-2 w-full",
                            hasActiveItem
                              ? "text-primary" 
                              : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                          )}>
                            <GroupIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                            {!collapsed && (
                              <>
                                <span className="text-[10px] uppercase tracking-widest font-semibold flex-1 text-left">
                                  {group.label}
                                </span>
                                <ChevronDown className={cn(
                                  "h-3.5 w-3.5 transition-transform duration-200",
                                  isGroupExpanded && "rotate-180"
                                )} />
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenu className="ml-4 mt-1 border-l border-border pl-2">
                          {filteredItems.map((item) => {
                            const itemPath = item.url.split('?')[0];
                            const itemIsActive = location.pathname === itemPath || location.pathname.startsWith(itemPath + '/');
                            return (
                              <SidebarMenuItem key={item.url}>
                                <SidebarMenuButton asChild className="group">
                                  <NavLink
                                    to={item.url}
                                    end
                                    className={cn(
                                      "rounded-lg transition-all duration-200 font-medium pl-4 py-2 text-sm",
                                      itemIsActive
                                        ? "text-primary font-semibold"
                                        : "text-sidebar-foreground/70 hover:text-primary"
                                    )}
                                  >
                                    {!collapsed && <span>{item.label}</span>}
                                  </NavLink>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
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
                      <SidebarMenuButton className="group w-full relative pl-4">
                        <span className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                          (location.pathname === '/comunidade' || location.pathname === '/videos-bonus')
                            ? "bg-[#0D0D0D] opacity-100" 
                            : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
                        )} />
                        <div className={cn(
                          "flex items-center gap-3 rounded-lg transition-all duration-200 font-medium py-2.5 w-full",
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
                        {isMenuVisible('comunidade_feed') && (
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
                        )}
                        {isMenuVisible('comunidade_sala_aula') && (
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

              {/* Menu Cupons - Temporariamente desativado */}

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
                data-tour="configuracoes"
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