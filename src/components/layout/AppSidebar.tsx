import { Home, BookOpen, Star, Bell, Settings, LogOut, MessageSquare, Shield, TrendingUp, GraduationCap } from "lucide-react";
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
import logoAplicada from "@/assets/logo-aplicada-marca-completa.png";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const items = [
  { title: "Início", url: "/", icon: Home },
  { title: "Trilhas", url: "/trilhas", icon: GraduationCap },
  { title: "Minha Evolução", url: "/evolucao", icon: TrendingUp },
  { title: "Favoritos", url: "/favoritos", icon: Star },
  { title: "Chat IA", url: "/chat", icon: MessageSquare },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const { isAdmin, isMentorado } = useUserRole();
  const { signOut } = useAuth();
  console.log("[AppSidebar] isAdmin:", isAdmin);
  console.log("[AppSidebar] isMentorado:", isMentorado);
  const collapsed = !open;

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
  };


  return (
    <Sidebar className="border-r-2 border-primary/10 bg-background/50 backdrop-blur-sm">
      <SidebarHeader className="border-b-2 border-primary/10">
        <div className="flex h-16 items-center justify-center px-4 bg-gradient-to-br from-primary/5 to-transparent">
          {!collapsed ? (
            <img src={logoAplicada} alt="IAplicada" className="h-10 w-auto drop-shadow-md" />
          ) : (
            <img src={logoAplicada} alt="IAplicada" className="h-8 w-auto drop-shadow-sm" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => cn(
                        "relative rounded-lg transition-all duration-200 font-medium",
                        isActive 
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => cn(
                        "relative rounded-lg transition-all duration-200 font-medium",
                        isActive 
                          ? "text-primary font-semibold" 
                          : "text-foreground hover:text-primary"
                      )}
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>Painel Admin</span>}
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
            <SidebarMenuButton asChild>
        <NavLink 
          to="/configuracoes" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
            isActive ? "text-primary font-semibold" : "text-foreground hover:text-primary"
          )}
        >
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
