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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Produtos Disponíveis</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtosAtivos.map((produto) => (
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
        )}
      </div>

      <ProdutoDetalhesModal
        open={!!selectedProduto}
        onOpenChange={(open) => !open && setSelectedProduto(null)}
        produto={selectedProduto}
      />
    </div>
  );
}
