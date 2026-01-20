import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProdutosTab } from "@/components/admin/produtos/ProdutosTab";
import { UpsellsTab } from "@/components/admin/produtos/UpsellsTab";
import { RenovacoesTab } from "@/components/admin/produtos/RenovacoesTab";
import { JornadasTab } from "@/components/admin/produtos/JornadasTab";
import { EstatisticasProdutos } from "@/components/admin/produtos/EstatisticasProdutos";
import { DescontosTab } from "@/components/admin/produtos/DescontosTab";
import { Package, TrendingUp, RefreshCw, Map, BarChart3, Percent } from "lucide-react";
import { adminTheme } from "@/components/admin/adminTheme";

export default function GerenciarProdutos() {
  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <Package className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Gestão de Produtos</h1>
      </div>

      <Tabs defaultValue="produtos" className="w-full space-y-4">
        <TabsList className={adminTheme.tabsList}>
          <TabsTrigger value="produtos" className={adminTheme.tabsTrigger}>
            <Package className={adminTheme.tabsIcon} />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="upsells" className={adminTheme.tabsTrigger}>
            <TrendingUp className={adminTheme.tabsIcon} />
            Upsells
          </TabsTrigger>
          <TabsTrigger value="renovacoes" className={adminTheme.tabsTrigger}>
            <RefreshCw className={adminTheme.tabsIcon} />
            Renovações
          </TabsTrigger>
          <TabsTrigger value="jornadas" className={adminTheme.tabsTrigger}>
            <Map className={adminTheme.tabsIcon} />
            Jornadas
          </TabsTrigger>
          <TabsTrigger value="descontos" className={adminTheme.tabsTrigger}>
            <Percent className={adminTheme.tabsIcon} />
            Descontos
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className={adminTheme.tabsTrigger}>
            <BarChart3 className={adminTheme.tabsIcon} />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className={adminTheme.tabsContent}>
          <ProdutosTab />
        </TabsContent>

        <TabsContent value="upsells" className={adminTheme.tabsContent}>
          <UpsellsTab />
        </TabsContent>

        <TabsContent value="renovacoes" className={adminTheme.tabsContent}>
          <RenovacoesTab />
        </TabsContent>

        <TabsContent value="jornadas" className={adminTheme.tabsContent}>
          <JornadasTab />
        </TabsContent>

        <TabsContent value="descontos" className={adminTheme.tabsContent}>
          <DescontosTab />
        </TabsContent>

        <TabsContent value="estatisticas" className={adminTheme.tabsContent}>
          <EstatisticasProdutos />
        </TabsContent>
      </Tabs>
    </div>
  );
}
