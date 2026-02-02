import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasTab } from "@/components/admin/comunidade/CategoriasTab";
import { ModeracaoTab } from "@/components/admin/comunidade/ModeracaoTab";
import { ConversasIATab } from "@/components/admin/comunidade/ConversasIATab";
import { EstatisticasComunidadeTab } from "@/components/admin/comunidade/EstatisticasComunidadeTab";
import { FerramentasCompartilhadasTab } from "@/components/admin/comunidade/FerramentasCompartilhadasTab";
import { Users, Crown, Tags, MessagesSquare } from "lucide-react";
import { adminTheme } from "@/components/admin/adminTheme";

type MainTab = "categorias" | "gratuita" | "pagantes";
type GratuitaSubTab = "moderacao" | "estatisticas";
type PagantesSubTab = "conversas" | "ferramentas";

export default function GerenciarComunidade() {
  const [mainTab, setMainTab] = useState<MainTab>("categorias");
  const [gratuitaSubTab, setGratuitaSubTab] = useState<GratuitaSubTab>("moderacao");
  const [pagantesSubTab, setPagantesSubTab] = useState<PagantesSubTab>("conversas");

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <MessagesSquare className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Gerenciar Comunidade</h1>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as MainTab)}
        className="space-y-4"
      >
        <TabsList className={adminTheme.tabsList}>
          <TabsTrigger value="categorias" className={adminTheme.tabsTrigger}>
            <Tags className={adminTheme.tabsIcon} />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="gratuita" className={adminTheme.tabsTrigger}>
            <Users className={adminTheme.tabsIcon} />
            Comunidade Gratuita
          </TabsTrigger>
          <TabsTrigger value="pagantes" className={adminTheme.tabsTrigger}>
            <Crown className={adminTheme.tabsIcon} />
            Comunidade Pagantes
          </TabsTrigger>
        </TabsList>

        {/* Categorias Tab */}
        <TabsContent value="categorias" className={adminTheme.tabsContent}>
          <CategoriasTab />
        </TabsContent>

        {/* Comunidade Gratuita Tab with Sub-tabs */}
        <TabsContent value="gratuita" className="space-y-4">
          <Tabs
            value={gratuitaSubTab}
            onValueChange={(v) => setGratuitaSubTab(v as GratuitaSubTab)}
          >
            <TabsList className={adminTheme.tabsList}>
              <TabsTrigger value="moderacao" className={adminTheme.tabsTrigger}>
                Moderação
              </TabsTrigger>
              <TabsTrigger value="estatisticas" className={adminTheme.tabsTrigger}>
                Estatísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="moderacao" className={adminTheme.tabsContent}>
              <ModeracaoTab />
            </TabsContent>

            <TabsContent value="estatisticas" className={adminTheme.tabsContent}>
              <EstatisticasComunidadeTab />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Comunidade Pagantes Tab with Sub-tabs */}
        <TabsContent value="pagantes" className="space-y-4">
          <Tabs
            value={pagantesSubTab}
            onValueChange={(v) => setPagantesSubTab(v as PagantesSubTab)}
          >
            <TabsList className={adminTheme.tabsList}>
              <TabsTrigger value="conversas" className={adminTheme.tabsTrigger}>
                Conversas IA
              </TabsTrigger>
              <TabsTrigger value="ferramentas" className={adminTheme.tabsTrigger}>
                Ferramentas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversas" className={adminTheme.tabsContent}>
              <ConversasIATab />
            </TabsContent>

            <TabsContent value="ferramentas" className={adminTheme.tabsContent}>
              <FerramentasCompartilhadasTab />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
