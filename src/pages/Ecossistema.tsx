import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Handshake } from "lucide-react";

import { ProdutoCard } from "@/components/ecossistema/ProdutoCard";
import { ProdutoDetalhesModal } from "@/components/ecossistema/ProdutoDetalhesModal";
import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";
import { PageContainer } from "@/components/shared/PageContainer";
import { useProdutos, Produto } from "@/hooks/admin/useProdutos";
import { useUserProfile } from "@/hooks/useUserProfile";

/** O produto que corresponde ao plano da pessoa, por slug ou pelo nome. */
function ehOPlanoDaPessoa(produto: Produto, plano?: string | null) {
  if (!plano) return false;
  return (
    produto.slug === plano || produto.nome.toLowerCase().includes(plano.toLowerCase())
  );
}

/**
 * O ecossistema: o que a IAplicada oferece, e onde a pessoa está dentro disso.
 *
 * Era um título solto e duas pilhas de cartões sob dois `h2` comuns. Nenhuma
 * das duas coisas que se procura aqui estava respondida de relance: qual é o
 * meu plano hoje, e o que mais existe.
 *
 * Agora abre com o painel de marca dizendo o plano atual, e os produtos usam o
 * cartão padrão das bibliotecas. No fim entra o programa de indicação, que é o
 * único "produto" que não vive na tabela de produtos e que, por isso, nunca
 * aparecia nesta tela.
 */
export default function Ecossistema() {
  const { data: produtos, isLoading } = useProdutos();
  const { profile } = useUserProfile();
  const [selecionado, setSelecionado] = useState<Produto | null>(null);

  const plano = profile?.plano_mentoria;
  const ativos = produtos?.filter((p) => p.ativo) || [];
  const b2c = ativos.filter((p) => p.tipo === "b2c");
  const b2b = ativos.filter((p) => p.tipo === "b2b");
  const meuProduto = ativos.find((p) => ehOPlanoDaPessoa(p, plano));

  return (
    <PageContainer>
      <section className="painel-marca px-5 pb-6 pt-7 md:px-8 md:pb-8 md:pt-9">
        <MarcaIAplicada className="marca-de-fundo -right-[14%] top-1/2 h-[190%] w-auto max-w-none -translate-y-1/2 rotate-[14deg] md:right-[1%] md:h-[155%]" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <span className="rotulo-mono">Produtos</span>
            <h1 className="font-serif-display mt-1.5 text-3xl leading-[1.05] tracking-tight text-foreground md:text-4xl lg:text-[44px]">
              Ecossistema <em className="font-serif-italic text-primary">IAplicada</em>
            </h1>
            <p className="mt-2.5 max-w-prose text-sm text-muted-foreground md:text-base">
              O que existe para profissional solo, o que existe para empresa, e onde você
              está hoje dentro disso.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
            <div className="vidro p-3.5 sm:p-4">
              <div className="flex items-baseline justify-between gap-3 sm:block">
                <span className="rotulo-mono whitespace-nowrap text-[10px]">Seu plano</span>
                <p className="numero-painel text-base leading-none text-foreground sm:mt-2 sm:text-lg">
                  {meuProduto?.nome ?? plano ?? "Visitante"}
                </p>
              </div>
            </div>
            <div className="vidro p-3.5 sm:p-4">
              <div className="flex items-baseline justify-between gap-3 sm:block">
                <span className="rotulo-mono whitespace-nowrap text-[10px]">Solo</span>
                <p className="numero-painel text-2xl leading-none text-foreground sm:mt-2 sm:text-[30px]">
                  {b2c.length}
                </p>
              </div>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2">
                {b2c.length === 1 ? "produto" : "produtos"}
              </p>
            </div>
            <div className="vidro p-3.5 sm:p-4">
              <div className="flex items-baseline justify-between gap-3 sm:block">
                <span className="rotulo-mono whitespace-nowrap text-[10px]">Empresas</span>
                <p className="numero-painel text-2xl leading-none text-foreground sm:mt-2 sm:text-[30px]">
                  {b2b.length}
                </p>
              </div>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2">
                {b2b.length === 1 ? "produto" : "produtos"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="superficie h-[300px] animate-skeleton-pulse" />
          ))}
        </div>
      ) : (
        <>
          {b2c.length > 0 && (
            <section className="space-y-4">
              <h2 className="rotulo-mono">Para profissional solo</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {b2c.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    isUserPlan={ehOPlanoDaPessoa(produto, plano)}
                    onSaibaMais={() => setSelecionado(produto)}
                  />
                ))}
              </div>
            </section>
          )}

          {b2b.length > 0 && (
            <section className="space-y-4">
              <h2 className="rotulo-mono">Para empresas</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {b2b.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    isUserPlan={ehOPlanoDaPessoa(produto, plano)}
                    onSaibaMais={() => setSelecionado(produto)}
                  />
                ))}
              </div>
            </section>
          )}

          {/*
            O programa de indicação não é uma linha da tabela de produtos, é
            uma página inteira com regra própria. Por isso nunca apareceu
            aqui, mesmo sendo uma das formas de alguém se relacionar com a
            IAplicada. Entra como faixa, com o que ele faz e para onde leva.
          */}
          <section className="space-y-4">
            <h2 className="rotulo-mono">Para quem indica</h2>
            <Link
              to="/indica"
              className="superficie superficie-interativa group flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-8 md:p-6"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border/70 bg-surface">
                <Handshake className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </span>

              <div className="min-w-0 flex-1">
                <span className="rotulo-mono">Programa de indicação</span>
                <h3 className="mt-1 text-base font-medium text-foreground transition-colors group-hover:text-primary md:text-lg">
                  IAplicada Indica
                </h3>
                <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
                  Você apresenta um dono de empresa com a operação travada. A equipe conduz
                  proposta e fechamento. Fechou, você escolhe entre cashback progressivo ou
                  um aditivo no sistema que já roda para você.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end md:gap-1">
                <span className="rotulo-mono text-[10px]">Acompanhe por aqui</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Abrir o painel
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </span>
              </div>
            </Link>
          </section>
        </>
      )}

      <ProdutoDetalhesModal
        open={!!selecionado}
        onOpenChange={(aberto) => !aberto && setSelecionado(null)}
        produto={selecionado}
      />
    </PageContainer>
  );
}
