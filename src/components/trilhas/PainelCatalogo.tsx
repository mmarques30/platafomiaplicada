import { motion } from "framer-motion";

import { AnelProgresso } from "@/components/graficos";
import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";
import { useCatalogoTrilhas } from "@/hooks/useCatalogoTrilhas";
import { itemCascata, listaCascata, aoMontar } from "@/lib/motion";

/**
 * A abertura de Trilhas.
 *
 * A página abria com um título e caía direto na grade. Era a única tela de
 * entrada do Academy sem painel: quem chegava não sabia quantas trilhas
 * existem, quantas já andou, nem o quanto do catálogo já viu. Essa conta já
 * estava sendo feita, cartão por cartão, e em nenhum lugar somada.
 *
 * Agora ela abre como as outras entradas da plataforma: o painel de marca com
 * o símbolo atrás, o anel respondendo "quanto do catálogo" e três cartões de
 * vidro com o resto. O título continua o mesmo, no mesmo lugar.
 *
 * Sem nenhuma trilha publicada o painel se reduz ao título: anel em zero e
 * três cartões zerados não são informação.
 */
export function PainelCatalogo() {
  const { resumo, isLoading } = useCatalogoTrilhas();

  const cartoes = resumo
    ? [
        {
          rotulo: "Catálogo",
          valor: String(resumo.trilhas),
          apoio: resumo.trilhas === 1 ? "trilha publicada" : "trilhas publicadas",
        },
        {
          rotulo: "Em andamento",
          valor: String(resumo.emAndamento),
          apoio:
            resumo.concluidas > 0
              ? `${resumo.concluidas} ${resumo.concluidas === 1 ? "concluída" : "concluídas"}`
              : "nenhuma concluída ainda",
        },
        {
          rotulo: "Aulas",
          valor: String(resumo.aulasConcluidas),
          apoio: `de ${resumo.aulasTotais} no catálogo`,
        },
      ]
    : [];

  return (
    <section className="painel-marca px-5 pb-6 pt-7 md:px-8 md:pb-8 md:pt-9">
      <MarcaIAplicada className="marca-de-fundo -right-[14%] top-1/2 h-[190%] w-auto max-w-none -translate-y-1/2 rotate-[14deg] md:right-[1%] md:h-[155%]" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex min-w-0 items-center gap-6">
          {(isLoading || resumo) && (
            <AnelProgresso
              valor={resumo?.percentual ?? 0}
              rotulo="do catálogo"
              tamanho={118}
              className="shrink-0"
            />
          )}
          <div className="min-w-0">
            <span className="rotulo-mono">Academy</span>
            <h1 className="font-serif-display mt-1.5 text-3xl leading-[1.05] tracking-tight text-foreground md:text-4xl lg:text-[44px]">
              Trilhas <em className="font-serif-italic text-primary">de aprendizado</em>
            </h1>
            <p className="mt-2.5 max-w-prose text-sm text-muted-foreground md:text-base">
              Aplica IA na rotina: uma trilha por workflow, semana a semana.
            </p>
          </div>
        </div>

        {cartoes.length > 0 && (
          <motion.div
            variants={listaCascata}
            {...aoMontar}
            className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[412px] lg:flex-1"
          >
            {cartoes.map(({ rotulo, valor, apoio }) => (
              /* No celular os três cartões empilham, e em bloco cada um ficava
                 com 130px de altura: o painel sozinho passava de meia tela
                 antes da primeira trilha aparecer. Ali o rótulo e o número
                 dividem uma linha só, e o cartão cai para a metade da altura
                 sem perder nada do que diz. */
              <motion.div key={rotulo} variants={itemCascata} className="vidro p-3.5 sm:p-4">
                <div className="flex items-baseline justify-between gap-3 sm:block">
                  <span className="rotulo-mono whitespace-nowrap text-[10px]">{rotulo}</span>
                  <p className="numero-painel text-2xl leading-none text-foreground sm:mt-2 sm:text-[30px]">
                    {valor}
                  </p>
                </div>
                <p className="mt-1.5 text-xs leading-snug text-muted-foreground sm:mt-2">{apoio}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
