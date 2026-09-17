import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { LinhaRevelada } from "./LinhaRevelada";
import { COMPASSO, sobeEAparece } from "./motion-entrada";
import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";

interface EntryHeroProps {
  /** Disparado pelo CTA "Começar a aplicar" — abre o acesso (email + senha). */
  onStart: () => void;
}

/**
 * EntryHero — primeira tela da plataforma.
 *
 * O texto é o mesmo de antes, palavra por palavra. O que mudou é a disposição
 * e a chegada.
 *
 * Disposição: saiu do centro. Tudo alinhado à esquerda, numa coluna que ocupa
 * pouco mais da metade da largura, como no refractweb.com. Texto centralizado
 * obriga o olho a procurar o início de cada linha; alinhado à esquerda, a
 * leitura tem uma margem só. E o espaço que sobra à direita deixa de ser
 * sobra: é onde a luz do fundo aparece.
 *
 * Chegada: nada entra junto. A marca abre, as duas linhas do título sobem de
 * dentro da máscara com 150ms entre elas, a linha de apoio vem depois e o
 * botão por último. A sequência inteira leva pouco menos de dois segundos, que
 * é o tempo de ler o título uma vez.
 */
export function EntryHero({ onStart }: EntryHeroProps) {
  return (
    <div className="w-full max-w-3xl text-left">
      <motion.div variants={sobeEAparece(COMPASSO.marca, 0.7)} className="ia-entry-marca">
        <img src={logoIAplicada} alt="IAplicada" className="ia-entry-marca__logo" />
        <span className="ia-entry-marca__rule" aria-hidden />
      </motion.div>

      <h1 className="ia-entry-h1 mt-10 md:mt-12">
        <LinhaRevelada atraso={COMPASSO.tituloPrimeiraLinha}>Faça o dobro.</LinhaRevelada>
        <LinhaRevelada atraso={COMPASSO.tituloSegundaLinha} className="ia-entry-h1__destaque">
          Entregue em metade do tempo.
        </LinhaRevelada>
      </h1>

      <motion.p
        variants={sobeEAparece(COMPASSO.apoio)}
        className="ia-entry-sub mt-6 max-w-md md:mt-7"
      >
        Tudo em um só lugar para você aumentar seus resultados.
      </motion.p>

      <motion.div variants={sobeEAparece(COMPASSO.acao)} className="mt-10 md:mt-12">
        <button type="button" onClick={onStart} className="ia-entry-cta group">
          <span className="ia-entry-cta__label">Começar a aplicar</span>
          <span className="ia-entry-cta__icon" aria-hidden>
            <ArrowUpRight className="absolute h-5 w-5 -translate-x-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
            <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}
