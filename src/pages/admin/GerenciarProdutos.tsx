import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProdutosTab } from "@/components/admin/produtos/ProdutosTab";
import { UpsellsTab } from "@/components/admin/produtos/UpsellsTab";
import { JornadasTab } from "@/components/admin/produtos/JornadasTab";
import { EstatisticasProdutos } from "@/components/admin/produtos/EstatisticasProdutos";
import { Package, TrendingUp, Map, BarChart3 } from "lucide-react";

export default function GerenciarProdutos() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestão de Produtos</h1>
        <p className="text-muted-foreground">
          Gerencie produtos, upsells, jornadas e acompanhe estatísticas
        </p>
      </div>

      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="upsells" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Upsells
          </TabsTrigger>
          <TabsTrigger value="jornadas" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Jornadas
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <ProdutosTab />
        </TabsContent>

        <TabsContent value="upsells">
          <UpsellsTab />
        </TabsContent>

        <TabsContent value="jornadas">
          <JornadasTab />
        </TabsContent>

        <TabsContent value="estatisticas">
          <EstatisticasProdutos />
        </TabsContent>
      </Tabs>
    </div>
  );
}
