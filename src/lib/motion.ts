import type { Transition, Variants } from "framer-motion";

/**
 * Movimento da plataforma, no ritmo do site: deslocamento curto, curva de
 * saída e nada acima de 400ms. Quem desliga tudo é o `prefers-reduced-motion`
 * declarado em `src/index.css`, então aqui não há verificação por componente.
 */

/** Curva padrão: sai rápido, assenta devagar. */
export const EASE_SAIDA = [0.16, 1, 0.3, 1] as const;

export const transicaoPadrao: Transition = {
  duration: 0.28,
  ease: EASE_SAIDA,
};

/** Entrada de página: 10px e fade. */
export const entradaPagina: Variants = {
  inicial: { opacity: 0, y: 10 },
  ativo: { opacity: 1, y: 0, transition: transicaoPadrao },
  saida: { opacity: 0, y: -6, transition: { duration: 0.16, ease: "easeOut" } },
};

/** Troca de aba ou de painel dentro da mesma página. */
export const trocaPainel: Variants = {
  inicial: { opacity: 0, y: 8 },
  ativo: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE_SAIDA } },
  saida: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

/** Container de lista: os filhos entram em cascata de 40ms. */
export const listaCascata: Variants = {
  inicial: {},
  ativo: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

/** Item de lista. Usar junto de `listaCascata` no elemento pai. */
export const itemCascata: Variants = {
  inicial: { opacity: 0, y: 12 },
  ativo: { opacity: 1, y: 0, transition: transicaoPadrao },
};

/**
 * Barra de progresso animando do zero até o valor.
 * `progresso(62)` → variantes prontas para um `motion.div` de largura.
 */
export function progresso(valor: number): Variants {
  const alvo = Math.max(0, Math.min(100, valor));
  return {
    inicial: { width: "0%" },
    ativo: {
      width: `${alvo}%`,
      transition: { duration: 0.8, ease: EASE_SAIDA },
    },
  };
}

/** Atalho para `motion.*`: entra uma vez, quando aparece na tela. */
export const aoAparecer = {
  initial: "inicial",
  whileInView: "ativo",
  viewport: { once: true, margin: "-40px" },
} as const;

/** Atalho para `motion.*`: entra assim que monta. */
export const aoMontar = {
  initial: "inicial",
  animate: "ativo",
  exit: "saida",
} as const;
