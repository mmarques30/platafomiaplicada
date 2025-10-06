import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrilhasTab } from "@/components/admin/content/TrilhasTab";
import { ModulosTab } from "@/components/admin/content/ModulosTab";
import { VideosTab } from "@/components/admin/content/VideosTab";
import { ExerciciosTab } from "@/components/admin/exercicios/ExerciciosTab";

export default function GerenciarConteudo() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Conteúdo</h1>

      <Tabs defaultValue="trilhas" className="w-full">
        <TabsList>
          <TabsTrigger value="trilhas">Trilhas</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="exercicios">Exercícios Práticos</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
