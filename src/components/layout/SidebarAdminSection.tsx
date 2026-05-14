import { NavLink } from "react-router-dom";
import { Shield, EyeOff } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarAdminSectionProps {
  isAdmin: boolean;
  isViewingAs: boolean;
  resetView: () => void;
  collapsed: boolean;
}

export function SidebarAdminSection({
  isAdmin,
  isViewingAs,
  resetView,
  collapsed,
}: SidebarAdminSectionProps) {
  if (!isAdmin) return null;

  if (isViewingAs) {
    return (
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
    );
  }

  return (
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
                    ? "text-foreground font-semibold"
                    : "text-foreground/75 hover:text-foreground"
                )}
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
                      isActive
                        ? "bg-brand-strong opacity-100"
                        : "bg-brand-strong opacity-0 group-hover:opacity-50"
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
  );
}
