import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasTab } from "@/components/admin/comunidade/CategoriasTab";
import { ModeracaoTab } from "@/components/admin/comunidade/ModeracaoTab";
import { EstatisticasComunidadeTab } from "@/components/admin/comunidade/EstatisticasComunidadeTab";

export default function GerenciarComunidade() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerenciar Comunidade
        </h1>
        <p className="text-muted-foreground">
          Configure categorias, modere posts e visualize estatísticas da comunidade
        </p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger
            value="categorias"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Categorias
          </TabsTrigger>
          <TabsTrigger
            value="moderacao"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Moderação
          </TabsTrigger>
          <TabsTrigger
            value="estatisticas"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias">
          <CategoriasTab />
        </TabsContent>

        <TabsContent value="moderacao">
          <ModeracaoTab />
        </TabsContent>

        <TabsContent value="estatisticas">
          <EstatisticasComunidadeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
