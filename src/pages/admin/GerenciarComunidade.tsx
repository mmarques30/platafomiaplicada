import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasTab } from "@/components/admin/comunidade/CategoriasTab";
import { ModeracaoTab } from "@/components/admin/comunidade/ModeracaoTab";
import { ConversasIATab } from "@/components/admin/comunidade/ConversasIATab";
import { EstatisticasComunidadeTab } from "@/components/admin/comunidade/EstatisticasComunidadeTab";
import { FerramentasCompartilhadasTab } from "@/components/admin/comunidade/FerramentasCompartilhadasTab";
import { Users, Crown, Tags } from "lucide-react";

type MainTab = "categorias" | "gratuita" | "pagantes";
type GratuitaSubTab = "moderacao" | "estatisticas";
type PagantesSubTab = "conversas" | "ferramentas";

export default function GerenciarComunidade() {
  const [mainTab, setMainTab] = useState<MainTab>("categorias");
  const [gratuitaSubTab, setGratuitaSubTab] =
    useState<GratuitaSubTab>("moderacao");
  const [pagantesSubTab, setPagantesSubTab] =
    useState<PagantesSubTab>("conversas");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerenciar Comunidade
        </h1>
        <p className="text-muted-foreground">
          Configure categorias, modere posts, visualize conversas com MarIAna e
          estatísticas da comunidade
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as MainTab)}
        className="space-y-4"
      >
        <TabsList className="bg-muted/50 p-1 rounded-lg h-auto flex-wrap gap-1">
          <TabsTrigger
            value="categorias"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Tags className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger
            value="gratuita"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Comunidade Gratuita
          </TabsTrigger>
          <TabsTrigger
            value="pagantes"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            Comunidade Pagantes
          </TabsTrigger>
        </TabsList>

        {/* Categorias Tab */}
        <TabsContent value="categorias">
          <CategoriasTab />
        </TabsContent>

        {/* Comunidade Gratuita Tab with Sub-tabs */}
        <TabsContent value="gratuita" className="space-y-4">
          <Tabs
            value={gratuitaSubTab}
            onValueChange={(v) => setGratuitaSubTab(v as GratuitaSubTab)}
          >
            <TabsList className="bg-muted/30 p-1 rounded-lg">
              <TabsTrigger
                value="moderacao"
                className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Moderação
              </TabsTrigger>
              <TabsTrigger
                value="estatisticas"
                className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Estatísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="moderacao" className="mt-4">
              <ModeracaoTab />
            </TabsContent>

            <TabsContent value="estatisticas" className="mt-4">
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
            <TabsList className="bg-muted/30 p-1 rounded-lg">
              <TabsTrigger
                value="conversas"
                className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Conversas IA
              </TabsTrigger>
              <TabsTrigger
                value="ferramentas"
                className="rounded-md px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Ferramentas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversas" className="mt-4">
              <ConversasIATab />
            </TabsContent>

            <TabsContent value="ferramentas" className="mt-4">
              <FerramentasCompartilhadasTab />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
