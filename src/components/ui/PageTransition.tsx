import { motion } from "framer-motion";
import { ReactNode } from "react";

import { entradaPagina, aoMontar } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
}

/** Entrada de página: 10px e fade, na curva do resto da plataforma. */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div variants={entradaPagina} {...aoMontar}>
      {children}
    </motion.div>
  );
}
