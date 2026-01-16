import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FerramentasTab } from "@/components/admin/bibliotecas/FerramentasTab";
import { PromptsTab } from "@/components/admin/bibliotecas/PromptsTab";
import { IACopieUseTab } from "@/components/admin/bibliotecas/IACopieUseTab";
import { MetodosTab } from "@/components/admin/bibliotecas/MetodosTab";
import { FormulariosCustomizados } from "@/components/admin/formularios/FormulariosCustomizados";
import { PromptsAnalyticsTab } from "@/components/admin/bibliotecas/PromptsAnalyticsTab";
import { PageTitle } from "@/components/shared/PageTitle";

const validTabs = ["ferramentas", "prompts", "analytics-prompts", "ia-copie-use", "metodos", "formularios"];

export default function GerenciarBibliotecas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "ferramentas";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div>
      <PageTitle primary="Gerenciar" secondary="Bibliotecas" />
      <div className="mb-8" />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ferramentas">Ferramentas IA</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="analytics-prompts">Analytics Prompts</TabsTrigger>
          <TabsTrigger value="ia-copie-use">IA Copie e Use</TabsTrigger>
          <TabsTrigger value="metodos">Métodos</TabsTrigger>
          <TabsTrigger value="formularios">Formulários</TabsTrigger>
        </TabsList>

        <TabsContent value="ferramentas">
          <FerramentasTab />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptsTab />
        </TabsContent>

        <TabsContent value="analytics-prompts">
          <PromptsAnalyticsTab />
        </TabsContent>

        <TabsContent value="ia-copie-use">
          <IACopieUseTab />
        </TabsContent>

        <TabsContent value="metodos">
          <MetodosTab />
        </TabsContent>

        <TabsContent value="formularios">
          <FormulariosCustomizados />
        </TabsContent>
      </Tabs>
    </div>
  );
}
