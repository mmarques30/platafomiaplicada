import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";

export function AdminLayout() {
  useIdleLogout(); // Logout automático após 10 minutos de inatividade
  
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminHeader />
      <div className="flex min-h-screen w-full pt-14 md:pt-0">
        <AdminSidebar />
        <SidebarInset>
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
