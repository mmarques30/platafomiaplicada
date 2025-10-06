import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FerramentasTab } from "@/components/admin/bibliotecas/FerramentasTab";
import { PromptsTab } from "@/components/admin/bibliotecas/PromptsTab";
import { IACopieUseTab } from "@/components/admin/bibliotecas/IACopieUseTab";
import { MetodosTab } from "@/components/admin/bibliotecas/MetodosTab";

export default function GerenciarBibliotecas() {
  const [activeTab, setActiveTab] = useState("ferramentas");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Bibliotecas</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ferramentas">Ferramentas IA</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="ia-copie-use">IA Copie e Use</TabsTrigger>
          <TabsTrigger value="metodos">Métodos</TabsTrigger>
        </TabsList>

        <TabsContent value="ferramentas">
          <FerramentasTab />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptsTab />
        </TabsContent>

        <TabsContent value="ia-copie-use">
          <IACopieUseTab />
        </TabsContent>

        <TabsContent value="metodos">
          <MetodosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
