import { useState } from "react";
import { Layers } from "lucide-react";
import { MeuPlanoCard } from "@/components/ecossistema/MeuPlanoCard";
import { ProdutoCard } from "@/components/ecossistema/ProdutoCard";
import { ProdutoDetalhesModal } from "@/components/ecossistema/ProdutoDetalhesModal";
import { useProdutos, Produto } from "@/hooks/admin/useProdutos";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Ecossistema() {
  const { data: produtos, isLoading } = useProdutos();
  const { profile } = useUserProfile();
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const produtosAtivos = produtos?.filter((p) => p.ativo) || [];
  const produtosB2C = produtosAtivos.filter((p) => p.tipo === 'b2c');
  const produtosB2B = produtosAtivos.filter((p) => p.tipo === 'b2b');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Layers className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Ecossistema IAplicada</h1>
          <p className="text-muted-foreground">
            Conheça todos os produtos e escolha o melhor para você
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Meu Plano</h2>
        <MeuPlanoCard />
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Produtos B2C</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {produtosB2C.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Para profissional solo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {produtosB2C.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    isUserPlan={
                      produto.slug === profile?.plano_mentoria ||
                      produto.nome.toLowerCase().includes(profile?.plano_mentoria || "")
                    }
                    onSaibaMais={() => setSelectedProduto(produto)}
                  />
                ))}
              </div>
            </div>
          )}

          {produtosB2B.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Para empresas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {produtosB2B.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    isUserPlan={
                      produto.slug === profile?.plano_mentoria ||
                      produto.nome.toLowerCase().includes(profile?.plano_mentoria || "")
                    }
                    onSaibaMais={() => setSelectedProduto(produto)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ProdutoDetalhesModal
        open={!!selectedProduto}
        onOpenChange={(open) => !open && setSelectedProduto(null)}
        produto={selectedProduto}
      />
    </div>
  );
}
