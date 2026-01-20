import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FerramentasTab } from "@/components/admin/bibliotecas/FerramentasTab";
import { PromptsTab } from "@/components/admin/bibliotecas/PromptsTab";
import { IACopieUseTab } from "@/components/admin/bibliotecas/IACopieUseTab";
import { MetodosTab } from "@/components/admin/bibliotecas/MetodosTab";
import { FormulariosCustomizados } from "@/components/admin/formularios/FormulariosCustomizados";
import { PromptsAnalyticsTab } from "@/components/admin/bibliotecas/PromptsAnalyticsTab";
import { adminTheme } from "@/components/admin/adminTheme";
import { Library, Wrench, MessageSquare, BarChart3, Copy, BookOpen, FileText } from "lucide-react";

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
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <Library className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Gerenciar Bibliotecas</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className={adminTheme.tabsList}>
          <TabsTrigger value="ferramentas" className={adminTheme.tabsTrigger}>
            <Wrench className={adminTheme.tabsIcon} />
            Ferramentas IA
          </TabsTrigger>
          <TabsTrigger value="prompts" className={adminTheme.tabsTrigger}>
            <MessageSquare className={adminTheme.tabsIcon} />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="analytics-prompts" className={adminTheme.tabsTrigger}>
            <BarChart3 className={adminTheme.tabsIcon} />
            Analytics Prompts
          </TabsTrigger>
          <TabsTrigger value="ia-copie-use" className={adminTheme.tabsTrigger}>
            <Copy className={adminTheme.tabsIcon} />
            IA Copie e Use
          </TabsTrigger>
          <TabsTrigger value="metodos" className={adminTheme.tabsTrigger}>
            <BookOpen className={adminTheme.tabsIcon} />
            Métodos
          </TabsTrigger>
          <TabsTrigger value="formularios" className={adminTheme.tabsTrigger}>
            <FileText className={adminTheme.tabsIcon} />
            Formulários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ferramentas" className={adminTheme.tabsContent}>
          <FerramentasTab />
        </TabsContent>

        <TabsContent value="prompts" className={adminTheme.tabsContent}>
          <PromptsTab />
        </TabsContent>

        <TabsContent value="analytics-prompts" className={adminTheme.tabsContent}>
          <PromptsAnalyticsTab />
        </TabsContent>

        <TabsContent value="ia-copie-use" className={adminTheme.tabsContent}>
          <IACopieUseTab />
        </TabsContent>

        <TabsContent value="metodos" className={adminTheme.tabsContent}>
          <MetodosTab />
        </TabsContent>

        <TabsContent value="formularios" className={adminTheme.tabsContent}>
          <FormulariosCustomizados />
        </TabsContent>
      </Tabs>
    </div>
  );
}
