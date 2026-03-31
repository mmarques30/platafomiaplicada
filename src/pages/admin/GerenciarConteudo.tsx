import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrilhasTab } from "@/components/admin/content/TrilhasTab";
import { ModulosTab } from "@/components/admin/content/ModulosTab";
import { VideosTab } from "@/components/admin/content/VideosTab";
import { ExerciciosTab } from "@/components/admin/exercicios/ExerciciosTab";
import { CentralTab } from "@/components/admin/content/CentralTab";
import { CuradoriaIATab } from "@/components/admin/content/CuradoriaIATab";
import { adminTheme } from "@/components/admin/adminTheme";
import { Route, Layers, Video, Dumbbell, LayoutGrid, Sparkles } from "lucide-react";

export default function GerenciarConteudo() {
  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <Video className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Gerenciar Conteúdo</h1>
      </div>

      <Tabs defaultValue="trilhas" className="w-full space-y-4">
        <TabsList className={adminTheme.tabsList}>
          <TabsTrigger value="trilhas" className={adminTheme.tabsTrigger}>
            <Route className={adminTheme.tabsIcon} />
            Trilhas
          </TabsTrigger>
          <TabsTrigger value="modulos" className={adminTheme.tabsTrigger}>
            <Layers className={adminTheme.tabsIcon} />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="videos" className={adminTheme.tabsTrigger}>
            <Video className={adminTheme.tabsIcon} />
            Vídeos
          </TabsTrigger>
          <TabsTrigger value="exercicios" className={adminTheme.tabsTrigger}>
            <Dumbbell className={adminTheme.tabsIcon} />
            Exercícios Práticos
          </TabsTrigger>
          <TabsTrigger value="central" className={adminTheme.tabsTrigger}>
            <LayoutGrid className={adminTheme.tabsIcon} />
            Central
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trilhas" className={adminTheme.tabsContent}>
          <TrilhasTab />
        </TabsContent>

        <TabsContent value="modulos" className={adminTheme.tabsContent}>
          <ModulosTab />
        </TabsContent>

        <TabsContent value="videos" className={adminTheme.tabsContent}>
          <VideosTab />
        </TabsContent>

        <TabsContent value="exercicios" className={adminTheme.tabsContent}>
          <ExerciciosTab />
        </TabsContent>

        <TabsContent value="central" className={adminTheme.tabsContent}>
          <CentralTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
