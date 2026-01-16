import { Card } from "@/components/ui/card";
import { useEstatisticasProdutos } from "@/hooks/admin/useProdutos";
import { Users, TrendingUp, DollarSign, Package } from "lucide-react";

export function EstatisticasProdutos() {
  const { data: stats, isLoading } = useEstatisticasProdutos();

  if (isLoading) {
    return <div>Carregando estatísticas...</div>;
  }

  const produtos = [
    { key: "academy", nome: "Academy", cor: "bg-blue-500" },
    { key: "skills", nome: "Skills", cor: "bg-orange-500" },
    { key: "business", nome: "Business", cor: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Estatísticas de Produtos</h2>
        <p className="text-muted-foreground">
          Distribuição de clientes por produto
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
              <p className="text-3xl font-bold">{stats?.total || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        {produtos.map((produto) => (
          <Card key={produto.key} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{produto.nome}</p>
                <p className="text-3xl font-bold">
                  {stats?.[produto.key as keyof typeof stats] || 0}
                </p>
                {stats && stats.total > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {((stats[produto.key as keyof typeof stats] / stats.total) * 100).toFixed(1)}% do total
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${produto.cor}/10`}>
                <Package className={`h-6 w-6 ${produto.cor.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Distribuição por Produto</h3>
              <p className="text-sm text-muted-foreground">Visualização proporcional</p>
            </div>
          </div>

          <div className="space-y-3">
            {produtos.map((produto) => {
              const valor = stats?.[produto.key as keyof typeof stats] || 0;
              const percentual = stats && stats.total > 0 ? (valor / stats.total) * 100 : 0;
              
              return (
                <div key={produto.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{produto.nome}</span>
                    <span className="font-medium">{valor} ({percentual.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`${produto.cor} h-2 rounded-full transition-all`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Potencial de Upsell</h3>
              <p className="text-sm text-muted-foreground">Oportunidades identificadas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium">Academy → Skills</p>
                <p className="text-xs text-muted-foreground">Clientes elegíveis</p>
              </div>
              <span className="text-2xl font-bold">{stats?.academy || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium">Academy → Business</p>
                <p className="text-xs text-muted-foreground">Clientes elegíveis</p>
              </div>
              <span className="text-2xl font-bold">{stats?.academy || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="text-sm font-medium">Skills → Business</p>
                <p className="text-xs text-muted-foreground">Clientes elegíveis</p>
              </div>
              <span className="text-2xl font-bold">{stats?.skills || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
