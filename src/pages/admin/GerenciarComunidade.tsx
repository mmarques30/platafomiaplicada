import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasTab } from "@/components/admin/comunidade/CategoriasTab";
import { ModeracaoTab } from "@/components/admin/comunidade/ModeracaoTab";
import { ConversasIATab } from "@/components/admin/comunidade/ConversasIATab";
import { EstatisticasComunidadeTab } from "@/components/admin/comunidade/EstatisticasComunidadeTab";
import { FerramentasCompartilhadasTab } from "@/components/admin/comunidade/FerramentasCompartilhadasTab";

export default function GerenciarComunidade() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerenciar Comunidade
        </h1>
        <p className="text-muted-foreground">
          Configure categorias, modere posts, visualize conversas com MarIAna e estatísticas da comunidade
        </p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-lg h-auto flex-wrap gap-1">
          <TabsTrigger
            value="categorias"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Categorias
          </TabsTrigger>
          <TabsTrigger
            value="moderacao"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Moderação
          </TabsTrigger>
          <TabsTrigger
            value="conversas"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Conversas IA
          </TabsTrigger>
          <TabsTrigger
            value="estatisticas"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Estatísticas
          </TabsTrigger>
          <TabsTrigger
            value="ferramentas"
            className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Ferramentas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias">
          <CategoriasTab />
        </TabsContent>

        <TabsContent value="moderacao">
          <ModeracaoTab />
        </TabsContent>

        <TabsContent value="conversas">
          <ConversasIATab />
        </TabsContent>

        <TabsContent value="estatisticas">
          <EstatisticasComunidadeTab />
        </TabsContent>

        <TabsContent value="ferramentas">
          <FerramentasCompartilhadasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
