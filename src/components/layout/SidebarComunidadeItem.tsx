import { NavLink } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarComunidadeItemProps {
  currentEnvironment: string | null;
  collapsed: boolean;
  expandedMenus: string[];
  toggleMenu: (key: string) => void;
  isMenuVisible: (key: string) => boolean;
  pathname: string;
}

export function SidebarComunidadeItem({
  currentEnvironment,
  collapsed,
  expandedMenus,
  toggleMenu,
  isMenuVisible,
  pathname,
}: SidebarComunidadeItemProps) {
  if (isBusiness) return null;

  return (
    <Collapsible
      open={expandedMenus.includes('comunidade_menu')}
      onOpenChange={() => toggleMenu('comunidade_menu')}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="group w-full relative pl-4">
            <span className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-all duration-200",
              (pathname === '/comunidade' || pathname === '/videos-bonus')
                ? "bg-[#0D0D0D] opacity-100"
                : "bg-[#0D0D0D] opacity-0 group-hover:opacity-60"
            )} />
            <div className={cn(
              "flex items-center gap-3 rounded-lg transition-all duration-200 font-medium py-2.5 w-full",
              (pathname === '/comunidade' || pathname === '/videos-bonus')
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
                      pathname === '/comunidade'
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
                      pathname === '/videos-bonus'
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
  );
}
