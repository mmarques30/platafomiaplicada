import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Produto } from "@/hooks/admin/useProdutos";

interface ProdutoDetalhesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: Produto | null;
}

export function ProdutoDetalhesModal({
  open,
  onOpenChange,
  produto,
}: ProdutoDetalhesModalProps) {
  if (!produto) return null;

  const formatPreco = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getPrecoExibicao = () => {
    if (produto.is_consultoria) {
      return `${formatPreco(produto.valor_minimo || 0)} - ${formatPreco(produto.valor_maximo || 0)}`;
    }
    if (produto.valor_com_desconto) {
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {formatPreco(produto.valor_com_desconto)}
          </span>
          <span className="text-lg text-muted-foreground line-through">
            {formatPreco(produto.valor)}
          </span>
        </div>
      );
    }
    return (
      <span className="text-3xl font-bold text-primary">
        {formatPreco(produto.valor)}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl">{produto.nome}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{produto.formato}</Badge>
              {produto.duracao && (
                <Badge variant="outline">{produto.duracao}</Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-base pt-2">
            {produto.descricao_curta}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {produto.imagem_url && (
            <div className="w-full aspect-video rounded-lg overflow-hidden">
              <img
                src={produto.imagem_url}
                alt={produto.nome}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Investimento</h3>
            <div className="flex items-baseline gap-2">
              {getPrecoExibicao()}
              {produto.periodicidade && (
                <span className="text-muted-foreground">/{produto.periodicidade}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Sobre o produto</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {produto.descricao_completa}
            </p>
          </div>

          {produto.beneficios && produto.beneficios.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">O que você vai ter acesso</h3>
              <ul className="space-y-2">
                {produto.beneficios.map((beneficio, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{beneficio}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={() =>
                window.open("https://wa.me/5511999999999", "_blank")
              }
            >
              Entre em contato
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
