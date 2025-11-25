import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  Library,
  Bell,
  FileText,
  Database,
  GraduationCap,
  ArrowLeft,
  FileSearch,
  CheckSquare,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/usuarios", label: "Gerenciar Usuários", icon: Users },
  { path: "/admin/conteudo", label: "Gerenciar Conteúdo", icon: BookOpen },
  { path: "/admin/bibliotecas", label: "Gerenciar Bibliotecas", icon: Library },
  { path: "/admin/avisos", label: "Gerenciar Avisos", icon: Bell },
  { path: "/admin/conhecimento", label: "Base de Conhecimento", icon: Database },
  { path: "/admin/mentoria", label: "Gerenciar Mentoria", icon: GraduationCap },
  { path: "/admin/produtos", label: "Produtos", icon: Package },
  { path: "/admin/minhas-tarefas", label: "Minhas Tarefas", icon: CheckSquare },
  { path: "/admin/auditoria", label: "Auditoria do Sistema", icon: FileSearch },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between p-2">
          {state === "expanded" && (
            <h2 className="text-xl font-bold">Painel Admin</h2>
          )}
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label} className="group">
                      <NavLink 
                        to={item.path}
                        className={cn(
                          "relative font-medium transition-colors duration-200 pl-4",
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
                        <Icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voltar para o Site">
              <Button
                variant="ghost"
                className="relative w-full justify-start text-foreground hover:text-primary font-medium transition-colors pl-4 group"
                onClick={() => navigate("/")}
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-aplicada-green-400 opacity-0 group-hover:opacity-60 transition-all duration-200" />
                <ArrowLeft />
                <span>Voltar para o Site</span>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
