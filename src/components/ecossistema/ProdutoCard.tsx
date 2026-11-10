import { Check, Layers } from "lucide-react";

import { CartaoRecurso, MarcadorCapa } from "@/components/bibliotecas/CartaoRecurso";
import { ChipMeta } from "@/components/bibliotecas/ChipsRecurso";
import { Produto } from "@/hooks/admin/useProdutos";

interface ProdutoCardProps {
  produto: Produto;
  isUserPlan: boolean;
  onSaibaMais: () => void;
}

function emReais(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

/**
 * Um produto do ecossistema.
 *
 * Era um cartão com a imagem em cima, o nome, o preço em corpo 24 e um botão
 * "Saiba mais" que repetia o que o cartão inteiro já faz ao ser clicado. O
 * plano atual da pessoa era marcado trocando o fundo e escrevendo `text-white`
 * e `bg-white` à mão — em tema claro, texto branco sobre fundo branco.
 *
 * Agora é o cartão padrão das bibliotecas, o mesmo de modelos, skills e
 * biblioteca: capa com a imagem do produto (ou desenhada a partir do nome
 * quando não há), o público na primeira linha, o preço na segunda, e o plano
 * atual marcado por um chip, não por uma inversão de cores.
 */
export function ProdutoCard({ produto, isUserPlan, onSaibaMais }: ProdutoCardProps) {
  const preco =
    produto.tipo === "b2b"
      ? "Sob consulta"
      : produto.is_consultoria
        ? `${emReais(produto.valor_minimo || 0)} – ${emReais(produto.valor_maximo || 0)}`
        : emReais(produto.valor);

  return (
    <CartaoRecurso
      chaveCapa={produto.nome}
      imagemUrl={produto.imagem_url}
      marcador={
        <MarcadorCapa>
          <Layers className="h-6 w-6 text-primary" strokeWidth={1.5} />
        </MarcadorCapa>
      }
      capaRotulo={produto.tipo === "b2b" ? "Para empresas" : "Para profissional solo"}
      capaTitulo={preco}
      titulo={produto.nome}
      descricao={produto.descricao_curta}
      rodape={
        <>
          {isUserPlan && (
            <ChipMeta>
              <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              Seu plano
            </ChipMeta>
          )}
          {produto.periodicidade && <ChipMeta>{produto.periodicidade}</ChipMeta>}
          {produto.duracao && <ChipMeta>{produto.duracao}</ChipMeta>}
        </>
      }
      aoClicar={onSaibaMais}
      className={isUserPlan ? "border-primary/45" : undefined}
    />
  );
}
