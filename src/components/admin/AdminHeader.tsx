import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  return (
    <header className="flex md:hidden h-14 items-center gap-4 border-b border-border/40 bg-[#123829] px-4 fixed top-0 left-0 right-0 z-50">
      <SidebarTrigger className="text-white hover:bg-white/10" />
      <h1 className="text-lg font-bold text-white">Painel Admin</h1>
    </header>
  );
}
