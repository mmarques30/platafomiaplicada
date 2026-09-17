import type { Transition, Variants } from "framer-motion";

/**
 * A coreografia da entrada da plataforma.
 *
 * O vocabulário veio de refractweb.com, que roda GSAP com SplitText e Lenis.
 * Aqui não entra biblioteca nova: o mesmo efeito sai do framer-motion que o
 * projeto já usa. O que foi copiado são as três coisas que fazem a diferença.
 *
 * 1. As curvas. `SAIDA_LONGA` é a easeOutQuint que o site usa em quase tudo:
 *    arranca rápido e leva quase um segundo assentando. `SAIDA_CURTA` é a
 *    mesma família, para o que precisa responder na hora.
 *
 * 2. O tempo. Nada entra junto. Cada elemento tem seu instante, em degraus de
 *    100 a 150ms, e o título é o mais lento de todos, porque é ele que a
 *    pessoa está lendo.
 *
 * 3. A máscara. O texto não aparece: ele sobe de dentro de uma fresta. É o que
 *    o SplitText faz linha a linha, e o que `LinhaRevelada` reproduz aqui.
 *
 * Quem desliga tudo isso é o `prefers-reduced-motion` declarado no index.css.
 */

/** easeOutQuint. A curva dominante do site de referência. */
export const SAIDA_LONGA = [0.22, 1, 0.36, 1] as const;

/** easeOutExpo. Para o que responde a um clique, não a uma chegada. */
export const SAIDA_CURTA = [0.16, 1, 0.3, 1] as const;

/** O instante de cada elemento na chegada da tela, em segundos. */
export const COMPASSO = {
  marca: 0.05,
  tituloPrimeiraLinha: 0.15,
  tituloSegundaLinha: 0.3,
  apoio: 0.55,
  acao: 0.7,
  rodape: 0.9,
} as const;

/** Sobe 20px e aparece. O degrau mais comum da sequência. */
export function sobeEAparece(atraso: number, duracao = 0.8): Variants {
  return {
    inicial: { opacity: 0, y: 20 },
    ativo: {
      opacity: 1,
      y: 0,
      transition: { duration: duracao, delay: atraso, ease: SAIDA_LONGA },
    },
    saida: { opacity: 0, y: -12, transition: { duration: 0.24, ease: "easeOut" } },
  };
}

/** Só aparece, sem deslocamento. Para o que não deve puxar o olho. */
export function apenasAparece(atraso: number, duracao = 0.6): Variants {
  return {
    inicial: { opacity: 0 },
    ativo: { opacity: 1, transition: { duration: duracao, delay: atraso } },
    saida: { opacity: 0, transition: { duration: 0.2 } },
  };
}

/**
 * A linha de texto subindo de dentro da máscara.
 *
 * O pai é `overflow-hidden`; o filho começa 110% abaixo e sobe até zero. Os
 * 110% em vez de 100% cobrem as descidas das letras (g, p, q), que senão
 * aparecem por baixo da fresta antes da hora.
 */
export function revelaLinha(atraso: number): Variants {
  return {
    inicial: { y: "110%" },
    ativo: {
      y: "0%",
      transition: { duration: 1.1, delay: atraso, ease: SAIDA_LONGA },
    },
    saida: { y: "-110%", transition: { duration: 0.3, ease: "easeIn" } },
  };
}

/** A troca entre o hero e o acesso: sai para cima, entra de baixo. */
export const trocaDeCena: Transition = { duration: 0.5, ease: SAIDA_LONGA };

/** Estados nomeados, para não repetir as strings em cada componente. */
export const aoEntrar = { initial: "inicial", animate: "ativo", exit: "saida" } as const;

export const CHAVE_ABERTURA = "iaplicada_abertura_vista";

/** Se a abertura deve tocar nesta carga. */
export function deveTocarAbertura(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return !sessionStorage.getItem(CHAVE_ABERTURA);
  } catch {
    return true;
  }
}

