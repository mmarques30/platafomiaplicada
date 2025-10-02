import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrilhasTab } from "@/components/admin/content/TrilhasTab";
import { CursosTab } from "@/components/admin/content/CursosTab";
import { ModulosTab } from "@/components/admin/content/ModulosTab";
import { VideosTab } from "@/components/admin/content/VideosTab";

export default function GerenciarConteudo() {
  const [activeTab, setActiveTab] = useState("trilhas");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Conteúdo</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trilhas">Trilhas</TabsTrigger>
          <TabsTrigger value="cursos">Cursos</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
        </TabsList>

        <TabsContent value="trilhas">
          <TrilhasTab />
        </TabsContent>

        <TabsContent value="cursos">
          <CursosTab />
        </TabsContent>

        <TabsContent value="modulos">
          <ModulosTab />
        </TabsContent>

        <TabsContent value="videos">
          <VideosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
