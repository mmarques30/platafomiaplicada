import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  return (
    <header className="flex md:hidden h-14 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 fixed top-0 left-0 right-0 z-50">
      <SidebarTrigger className="text-sidebar-foreground hover:bg-sidebar-accent" />
      <h1 className="text-lg font-bold text-sidebar-foreground">Painel Admin</h1>
    </header>
  );
}
