import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Produto } from "@/hooks/admin/useProdutos";

interface ProdutoCardProps {
  produto: Produto;
  isUserPlan: boolean;
  onSaibaMais: () => void;
}

export function ProdutoCard({ produto, isUserPlan, onSaibaMais }: ProdutoCardProps) {
  const formatPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getPrecoExibicao = () => {
    // Produtos B2B mostram "Sob consulta"
    if (produto.tipo === 'b2b') {
      return 'Sob consulta';
    }
    if (produto.is_consultoria) {
      return `${formatPreco(produto.valor_minimo || 0)} - ${formatPreco(produto.valor_maximo || 0)}`;
    }
    return formatPreco(produto.valor);
  };

  return (
    <Card 
      className={`group transition-all duration-200 hover:shadow-lg ${
        isUserPlan 
          ? 'bg-zinc-900 border-zinc-700 text-white' 
          : 'hover:border-primary/20'
      }`}
    >
      <CardContent className="p-6 space-y-6">
        {produto.imagem_url ? (
          <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
            <img
              src={produto.imagem_url}
              alt={produto.nome}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] w-full rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/30">
              {produto.nome.charAt(0)}
            </span>
          </div>
        )}

        <div className="space-y-3">
          <h3 className={`text-xl font-semibold ${isUserPlan ? 'text-white' : ''}`}>
            {produto.nome}
          </h3>

          <p className={`text-2xl font-bold ${isUserPlan ? 'text-white' : 'text-primary'}`}>
            {getPrecoExibicao()}
          </p>
          
          {produto.periodicidade && (
            <p className={`text-xs ${isUserPlan ? 'text-zinc-400' : 'text-muted-foreground'}`}>
              {produto.periodicidade}
            </p>
          )}

          <p className={`text-sm line-clamp-2 ${isUserPlan ? 'text-zinc-300' : 'text-muted-foreground'}`}>
            {produto.descricao_curta}
          </p>
        </div>

        <Button
          onClick={onSaibaMais}
          variant={isUserPlan ? "secondary" : "outline"}
          className={`w-full ${
            isUserPlan 
              ? 'bg-white text-zinc-900 hover:bg-zinc-100' 
              : 'group-hover:bg-primary/5'
          }`}
        >
          Saiba mais
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
