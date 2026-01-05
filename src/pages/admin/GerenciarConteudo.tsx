import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrilhasTab } from "@/components/admin/content/TrilhasTab";
import { ModulosTab } from "@/components/admin/content/ModulosTab";
import { VideosTab } from "@/components/admin/content/VideosTab";
import { ExerciciosTab } from "@/components/admin/exercicios/ExerciciosTab";
import { CentralTab } from "@/components/admin/content/CentralTab";
import { PageTitle } from "@/components/shared/PageTitle";

export default function GerenciarConteudo() {
  return (
    <div>
      <PageTitle primary="Gerenciar" secondary="Conteúdo" />
      <div className="mb-8" />

      <Tabs defaultValue="trilhas" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="trilhas">Trilhas</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="exercicios">Exercícios Práticos</TabsTrigger>
          <TabsTrigger value="central">Central</TabsTrigger>
        </TabsList>

        <TabsContent value="trilhas" className="mt-6">
          <TrilhasTab />
        </TabsContent>

        <TabsContent value="modulos" className="mt-6">
          <ModulosTab />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <VideosTab />
        </TabsContent>

        <TabsContent value="exercicios" className="mt-6">
          <ExerciciosTab />
        </TabsContent>

        <TabsContent value="central" className="mt-6">
          <CentralTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
