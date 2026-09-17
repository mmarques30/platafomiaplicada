import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CAMINHO_FOLHA, FOLHAS, TONS_MARCA } from "@/lib/marca";
import { CHAVE_ABERTURA, SAIDA_LONGA } from "./motion-entrada";

/**
 * A abertura: a marca se desenha antes de a tela aparecer.
 *
 * É o gesto de chegada do refractweb.com, reproduzido com a nossa marca. Lá,
 * uma sobreposição preta cobre a página, a logo aparece no centro em três
 * camadas do mesmo caminho (o contorno que se desenha com stroke-dasharray, o
 * preenchimento que entra depois, e uma cópia com brilho por cima), e então a
 * sobreposição sobe e some. Aqui é a mesma coreografia, em quatro tempos:
 *
 *   0,0s  o contorno das quatro folhas começa a se desenhar (1,1s)
 *   0,9s  o preenchimento entra, folha a folha, nos quatro tons
 *   1,3s  um brilho lime floresce atrás e apaga
 *   1,9s  a cortina sobe e libera a tela, que só então começa a própria
 *         chegada (marca, título, apoio, botão)
 *
 * O contorno usa o `pathLength` do framer-motion em vez de medir o caminho na
 * mão: ele normaliza o comprimento para 1 e anima o dasharray por baixo.
 *
 * Toca uma vez por sessão do navegador. Voltar para /auth no meio do uso não
 * repete a abertura; recarregar a página, sim. Com `prefers-reduced-motion`,
 * não toca: a tela aparece direto.
 */

interface AberturaMarcaProps {
  /** Chamado quando a cortina termina de subir. */
  onConcluir: () => void;
}

const DURACAO_TRACO = 1.1;
const ENTRA_PREENCHIMENTO = 0.9;
const ENTRA_BRILHO = 1.3;
const SOBE_CORTINA = 1.9;

export function AberturaMarca({ onConcluir }: AberturaMarcaProps) {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisivel(false), SOBE_CORTINA * 1000);
    return () => window.clearTimeout(t);
  }, []);

  const concluir = () => {
    try {
      sessionStorage.setItem(CHAVE_ABERTURA, "1");
    } catch {
      /* sem sessionStorage a abertura só toca de novo; não é erro */
    }
    onConcluir();
  };

  return (
    <AnimatePresence onExitComplete={concluir}>
      {visivel && (
        <motion.div
          key="abertura"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -24, transition: { duration: 0.6, ease: SAIDA_LONGA } }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" className="h-32 w-32 md:h-44 md:w-44" overflow="visible">
            <defs>
              <filter id="abertura-brilho" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* 3. o brilho, atrás de tudo: floresce e apaga */}
            <motion.g
              filter="url(#abertura-brilho)"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 0.75, 0], scale: [0.9, 1.08, 1.12] }}
              transition={{ duration: 1, delay: ENTRA_BRILHO, ease: "easeOut" }}
              style={{ transformOrigin: "50px 50px" }}
            >
              {FOLHAS.map((folha) => (
                <path
                  key={folha.tom}
                  d={CAMINHO_FOLHA}
                  transform={`rotate(${folha.giro} 50 50)`}
                  fill="hsl(var(--lime-glow))"
                />
              ))}
            </motion.g>

            {/* 2. o preenchimento, folha a folha, nos tons da marca */}
            {FOLHAS.map((folha, indice) => (
              <motion.path
                key={`preenchimento-${folha.tom}`}
                d={CAMINHO_FOLHA}
                transform={`rotate(${folha.giro} 50 50)`}
                fill={TONS_MARCA[folha.tom]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: ENTRA_PREENCHIMENTO + indice * 0.08,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* 1. o contorno que se desenha */}
            {FOLHAS.map((folha, indice) => (
              <motion.path
                key={`traco-${folha.tom}`}
                d={CAMINHO_FOLHA}
                transform={`rotate(${folha.giro} 50 50)`}
                fill="none"
                stroke="hsl(var(--lime-glow))"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: [1, 1, 0] }}
                transition={{
                  pathLength: { duration: DURACAO_TRACO, delay: indice * 0.1, ease: SAIDA_LONGA },
                  opacity: { duration: 0.6, delay: ENTRA_PREENCHIMENTO + 0.4, times: [0, 0.3, 1] },
                }}
              />
            ))}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
