import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Library,
  Bell,
  GraduationCap,
  ArrowLeft,
  CheckSquare,
  Package,
  Settings,
  MessagesSquare,
  Briefcase,
  Smartphone,
  LucideIcon,
  ChevronDown,
  FolderKanban,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuItem {
  path: string;
  label: string;
  icon?: LucideIcon;
}

interface MenuGroup {
  type: "standalone" | "group";
  label: string;
  icon: LucideIcon;
  path?: string;
  items?: MenuItem[];
}

// Menus para ambiente Gestão (apenas admin)
const gestaoMenuGroups: MenuGroup[] = [
  {
    type: "standalone",
    path: "/admin/gestao",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "group",
    label: "Usuários",
    icon: Users,
    items: [
      { path: "/admin/gestao/usuarios", label: "Gerenciar Usuários" },
      { path: "/admin/gestao/visitantes", label: "Visitantes" },
      { path: "/admin/gestao/candidaturas", label: "Candidaturas" },
    ],
  },
  {
    type: "group",
    label: "Conteúdo",
    icon: BookOpen,
    items: [
      { path: "/admin/gestao/conteudo", label: "Gerenciar Conteúdo" },
      { path: "/admin/gestao/bibliotecas", label: "Gerenciar Bibliotecas" },
      { path: "/admin/gestao/materiais", label: "Materiais Gratuitos" },
    ],
  },
  {
    type: "group",
    label: "Mentoria",
    icon: GraduationCap,
    items: [
      { path: "/admin/gestao/mentoria/bonus", label: "Bônus Globais" },
      { path: "/admin/gestao/mentoria/academy", label: "Academy" },
      { path: "/admin/gestao/mentoria/business", label: "Business" },
      { path: "/admin/gestao/mentoria/preview-paineis", label: "Preview Painéis" },
      { path: "/admin/gestao/formularios", label: "Diagnósticos" },
      { path: "/admin/gestao/duvidas", label: "Central de Dúvidas" },
    ],
  },
  {
    type: "group",
    label: "Comunicação",
    icon: MessagesSquare,
    items: [
      { path: "/admin/gestao/avisos", label: "Gerenciar Avisos" },
      { path: "/admin/gestao/comunidade", label: "Comunidade" },
      { path: "/admin/gestao/pesquisas", label: "Pesquisas" },
    ],
  },
  {
    type: "group",
    label: "Gestão",
    icon: Briefcase,
    items: [
      { path: "/admin/gestao/produtos", label: "Produtos" },
    ],
  },
  {
    type: "group",
    label: "Sistema",
    icon: Settings,
    items: [
      { path: "/admin/gestao/menus", label: "Menus" },
      { path: "/admin/gestao/auditoria", label: "Auditoria do Sistema" },
      { path: "/admin/gestao/conhecimento", label: "Base de Conhecimento" },
    ],
  },
];

// Menus para ambiente Projetos (admin e equipe)
const projetosMenuGroups: MenuGroup[] = [
  {
    type: "standalone",
    path: "/admin/projetos",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "standalone",
    path: "/admin/projetos/tarefas",
    label: "Tarefas",
    icon: CheckSquare,
  },
];

// Menus para seleção de ambiente (página inicial admin)
const selectorMenuGroups: MenuGroup[] = [
  {
    type: "standalone",
    path: "/admin",
    label: "Selecionar Ambiente",
    icon: Home,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { isAdmin } = useUserRole();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // Determinar qual ambiente estamos
  const isInGestao = location.pathname.startsWith("/admin/gestao");
  const isInProjetos = location.pathname.startsWith("/admin/projetos");
  const isInSelector = location.pathname === "/admin";

  // Selecionar menus baseado no ambiente
  const menuGroups = isInGestao 
    ? gestaoMenuGroups 
    : isInProjetos 
      ? projetosMenuGroups 
      : selectorMenuGroups;

  const environmentTitle = isInGestao 
    ? "Gestão" 
    : isInProjetos 
      ? "Projetos" 
      : "Admin";

  // Auto-expand group containing current route
  useEffect(() => {
    const currentGroup = menuGroups.find(
      (g) => g.type === "group" && g.items?.some((i) => location.pathname === i.path)
    );
    if (currentGroup && !openGroups.includes(currentGroup.label)) {
      setOpenGroups((prev) => [...prev, currentGroup.label]);
    }
  }, [location.pathname, menuGroups]);

  const toggleGroup = (label: string, open: boolean) => {
    if (open) {
      setOpenGroups((prev) => [...prev, label]);
    } else {
      setOpenGroups((prev) => prev.filter((g) => g !== label));
    }
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items?.some((item) => location.pathname === item.path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between p-2">
          {state === "expanded" && (
            <h2 className="text-xl font-bold">{environmentTitle}</h2>
          )}
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuGroups.map((group) => {
                const Icon = group.icon;

                if (group.type === "standalone") {
                  const isActive = location.pathname === group.path;
                  return (
                    <SidebarMenuItem key={group.path}>
                      <SidebarMenuButton asChild tooltip={group.label} className="group">
                        <NavLink
                          to={group.path!}
                          className={cn(
                            "relative font-medium transition-colors duration-200 pl-4",
                            isActive
                              ? "text-primary font-semibold"
                              : "text-sidebar-foreground hover:text-primary"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                              isActive
                                ? "bg-primary opacity-100"
                                : "bg-primary/40 opacity-0 group-hover:opacity-60"
                            )}
                          />
                          <Icon className="h-4 w-4" />
                          <span>{group.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Collapsible group
                const groupActive = isGroupActive(group);
                return (
                  <Collapsible
                    key={group.label}
                    open={openGroups.includes(group.label)}
                    onOpenChange={(open) => toggleGroup(group.label, open)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={group.label}
                          className={cn(
                            "group relative w-full font-medium transition-colors duration-200 pl-4",
                            groupActive
                              ? "text-primary font-semibold"
                              : "text-sidebar-foreground hover:text-primary"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                              groupActive
                                ? "bg-primary opacity-100"
                                : "bg-primary/40 opacity-0 group-hover:opacity-60"
                            )}
                          />
                          <Icon className="h-4 w-4" />
                          <span className="flex-1">{group.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openGroups.includes(group.label) ? "rotate-180" : ""
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenu className="ml-4 mt-1 border-l border-border pl-2">
                          {group.items?.map((item) => {
                            const isItemActive = location.pathname === item.path;
                            return (
                              <SidebarMenuItem key={item.path}>
                                <SidebarMenuButton asChild tooltip={item.label}>
                                  <NavLink
                                    to={item.path}
                                    className={cn(
                                      "relative font-medium transition-colors duration-200 pl-2 text-sm",
                                      isItemActive
                                        ? "text-primary font-semibold"
                                        : "text-sidebar-foreground/70 hover:text-primary"
                                    )}
                                  >
                                    <span>{item.label}</span>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {/* Botão para voltar à seleção de ambientes */}
          {(isInGestao || isInProjetos) && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Trocar Ambiente">
                <Button
                  variant="ghost"
                  className="relative w-full justify-start text-sidebar-foreground hover:text-primary font-medium transition-colors pl-4 group"
                  onClick={() => navigate("/admin")}
                >
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary/40 opacity-0 group-hover:opacity-60 transition-all duration-200" />
                  <FolderKanban className="h-4 w-4" />
                  <span>Trocar Ambiente</span>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voltar para o Site">
              <Button
                variant="ghost"
                className="relative w-full justify-start text-sidebar-foreground hover:text-primary font-medium transition-colors pl-4 group"
                onClick={() => navigate("/")}
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary/40 opacity-0 group-hover:opacity-60 transition-all duration-200" />
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para o Site</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
