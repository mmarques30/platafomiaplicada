import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProdutosTab } from "@/components/admin/produtos/ProdutosTab";
import { UpsellsTab } from "@/components/admin/produtos/UpsellsTab";
import { RenovacoesTab } from "@/components/admin/produtos/RenovacoesTab";
import { JornadasTab } from "@/components/admin/produtos/JornadasTab";
import { EstatisticasProdutos } from "@/components/admin/produtos/EstatisticasProdutos";
import { DescontosTab } from "@/components/admin/produtos/DescontosTab";
import { Package, TrendingUp, RefreshCw, Map, BarChart3, Percent } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="upsells" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Upsells
          </TabsTrigger>
          <TabsTrigger value="renovacoes" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Renovações
          </TabsTrigger>
          <TabsTrigger value="jornadas" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Jornadas
          </TabsTrigger>
          <TabsTrigger value="descontos" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Descontos
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

        <TabsContent value="renovacoes">
          <RenovacoesTab />
        </TabsContent>

        <TabsContent value="jornadas">
          <JornadasTab />
        </TabsContent>

        <TabsContent value="descontos">
          <DescontosTab />
        </TabsContent>

        <TabsContent value="estatisticas">
          <EstatisticasProdutos />
        </TabsContent>
      </Tabs>
    </div>
  );
}
