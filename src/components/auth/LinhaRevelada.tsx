import { motion } from "framer-motion";

import { revelaLinha } from "./motion-entrada";
import { cn } from "@/lib/utils";

interface LinhaReveladaProps {
  /** O texto da linha. Uma linha por componente, para a máscara funcionar. */
  children: React.ReactNode;
  /** Quando esta linha começa a subir, em segundos. */
  atraso: number;
  className?: string;
}

/**
 * Uma linha de texto que sobe de dentro de uma fresta.
 *
 * É o gesto que o SplitText do GSAP faz no site de referência, sem a
 * biblioteca: a máscara é o `overflow-hidden` do pai e o filho vem de baixo.
 *
 * A folga de `0.12em` existe porque a máscara corta no limite da caixa de
 * texto, e o itálico da Instrument Serif passa desse limite: sem ela, o pé do
 * "g" e a barriga do "Ç" ficam decepados depois que a animação termina.
 *
 * A folga fica no elemento que anda, não na máscara, com uma margem negativa
 * de igual valor na máscara para o layout não mudar. Se ela ficasse na
 * máscara, a área visível ficaria mais alta que a linha, e numa quebra de
 * texto a linha de baixo apareceria por essa fresta antes da hora.
 */
export function LinhaRevelada({ children, atraso, className }: LinhaReveladaProps) {
  return (
    <span className="block overflow-hidden [margin-bottom:-0.12em]">
      <motion.span
        variants={revelaLinha(atraso)}
        className={cn("block pb-[0.12em]", className)}
      >
        {children}
      </motion.span>
    </span>
  );
}
