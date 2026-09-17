import { motion } from "framer-motion";
import { ReactNode } from "react";

import { entradaPagina } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Entrada de página: 10px e fade, na curva do resto da plataforma.
 *
 * Só entrada, de propósito. Antes isto vivia dentro de um
 * `<AnimatePresence mode="wait">` chaveado pelo caminho da rota, para que a
 * página antiga saísse antes de a nova entrar. O efeito colateral era um bug
 * de tela em branco: ao voltar para uma rota já visitada, o conteúdo montava
 * já no estado de saída (`opacity: 0`, `y: -6`) e ficava lá para sempre. A
 * pessoa via o menu, o cabeçalho e um corpo vazio, e só saindo e entrando de
 * novo é que a página voltava.
 *
 * A causa é o `mode="wait"`: quem está saindo continua registrado pela chave
 * enquanto a animação de saída roda, e uma chave que reaparece nesse intervalo
 * herda o estado de saída em vez de recomeçar. Como a saída dura 160ms e a
 * entrada da nova página é o que se nota, tirar a saída não custa nada
 * visualmente e elimina a classe inteira do problema: sem `AnimatePresence`, a
 * troca de rota remonta este componente e a entrada toca sempre.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div variants={entradaPagina} initial="inicial" animate="ativo">
      {children}
    </motion.div>
  );
}
