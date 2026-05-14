import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useIdleLogout } from "@/hooks/useIdleLogout";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";

export function AdminLayout() {
  useIdleLogout();
  const location = useLocation();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminHeader />
      <div className="flex min-h-screen w-full pt-14 md:pt-0">
        <AdminSidebar />
        <SidebarInset>
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-10 lg:py-10">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
