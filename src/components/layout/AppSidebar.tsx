import { Home, BookOpen, Star, Bell, Settings, LogOut, MessageSquare } from "lucide-react";
import { NavLink } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logoAplicada from "@/assets/logo-aplicada.png";

const items = [
  { title: "Início", url: "/", icon: Home },
  { title: "Trilhas", url: "/trilhas", icon: BookOpen },
  { title: "Favoritos", url: "/favoritos", icon: Star },
  { title: "Chat IA", url: "/chat", icon: MessageSquare },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/auth");
  };

  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg smooth-transition ${
      isActive
        ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-primary"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
    }`;

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-center">
          {!collapsed ? (
            <img src={logoAplicada} alt="Aplicada" className="h-14 w-auto" />
          ) : (
            <img src={logoAplicada} alt="Aplicada" className="h-10 w-auto" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavLinkClasses}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/perfil" className={getNavLinkClasses}>
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Configurações</span>}
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
