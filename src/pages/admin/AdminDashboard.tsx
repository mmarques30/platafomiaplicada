import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { VisaoGeralTab } from "@/components/admin/dashboard/VisaoGeralTab";
import { UsuariosTab } from "@/components/admin/dashboard/UsuariosTab";
import { EngajamentoTab } from "@/components/admin/dashboard/EngajamentoTab";
import { PaginaGratuitaTab } from "@/components/admin/dashboard/PaginaGratuitaTab";
import { ConteudoTab } from "@/components/admin/dashboard/ConteudoTab";
import { MentoriaTab } from "@/components/admin/dashboard/MentoriaTab";
import { adminTheme } from "@/components/admin/adminTheme";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Video,
  GraduationCap,
  Eye,
} from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading || !data) {
    return (
      <div className={adminTheme.page}>
        <div className={adminTheme.pageTitleWrapper}>
          <LayoutDashboard className={adminTheme.pageIcon} />
          <h1 className={adminTheme.pageTitle}>Dashboard Administrativo</h1>
        </div>
        <div className="space-y-4 mt-4">
          <Skeleton className="h-10 w-full max-w-xl" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <LayoutDashboard className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Dashboard Administrativo</h1>
      </div>

      <PWAInstallBanner />

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList className={adminTheme.tabsList}>
          <TabsTrigger value="visao-geral" className={adminTheme.tabsTrigger}>
            <LayoutDashboard className={adminTheme.tabsIcon} />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="usuarios" className={adminTheme.tabsTrigger}>
            <Users className={adminTheme.tabsIcon} />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="engajamento" className={adminTheme.tabsTrigger}>
            <TrendingUp className={adminTheme.tabsIcon} />
            Engajamento
          </TabsTrigger>
          <TabsTrigger value="pagina-gratuita" className={adminTheme.tabsTrigger}>
            <Eye className={adminTheme.tabsIcon} />
            Página Gratuita
          </TabsTrigger>
          <TabsTrigger value="conteudo" className={adminTheme.tabsTrigger}>
            <Video className={adminTheme.tabsIcon} />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="mentoria" className={adminTheme.tabsTrigger}>
            <GraduationCap className={adminTheme.tabsIcon} />
            Mentoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className={adminTheme.tabsContent}>
          <VisaoGeralTab data={data} />
        </TabsContent>

        <TabsContent value="usuarios" className={adminTheme.tabsContent}>
          <UsuariosTab data={data} />
        </TabsContent>

        <TabsContent value="engajamento" className={adminTheme.tabsContent}>
          <EngajamentoTab />
        </TabsContent>

        <TabsContent value="pagina-gratuita" className={adminTheme.tabsContent}>
          <PaginaGratuitaTab />
        </TabsContent>

        <TabsContent value="conteudo" className={adminTheme.tabsContent}>
          <ConteudoTab data={data} />
        </TabsContent>

        <TabsContent value="mentoria" className={adminTheme.tabsContent}>
          <MentoriaTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
