import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { PWAInstallBanner } from "@/components/shared/PWAInstallBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { VisaoGeralTab } from "@/components/admin/dashboard/VisaoGeralTab";
import { UsuariosTab } from "@/components/admin/dashboard/UsuariosTab";
import { EngajamentoTab } from "@/components/admin/dashboard/EngajamentoTab";
import { ConteudoTab } from "@/components/admin/dashboard/ConteudoTab";
import { MentoriaTab } from "@/components/admin/dashboard/MentoriaTab";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Video,
  GraduationCap,
} from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full max-w-xl" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>

      <PWAInstallBanner />

      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="visao-geral" className="gap-2">
            <LayoutDashboard className="h-4 w-4 hidden sm:inline" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4 hidden sm:inline" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="engajamento" className="gap-2">
            <TrendingUp className="h-4 w-4 hidden sm:inline" />
            <span className="hidden sm:inline">Engajamento</span>
            <span className="sm:hidden">Engaj.</span>
          </TabsTrigger>
          <TabsTrigger value="conteudo" className="gap-2">
            <Video className="h-4 w-4 hidden sm:inline" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="mentoria" className="gap-2">
            <GraduationCap className="h-4 w-4 hidden sm:inline" />
            Mentoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <VisaoGeralTab data={data} />
        </TabsContent>

        <TabsContent value="usuarios">
          <UsuariosTab data={data} />
        </TabsContent>

        <TabsContent value="engajamento">
          <EngajamentoTab />
        </TabsContent>

        <TabsContent value="conteudo">
          <ConteudoTab data={data} />
        </TabsContent>

        <TabsContent value="mentoria">
          <MentoriaTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
