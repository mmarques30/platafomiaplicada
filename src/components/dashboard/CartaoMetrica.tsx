import { ReactNode } from "react";
import { motion } from "framer-motion";

import { itemCascata } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface CartaoMetricaProps {
  /** Rótulo em mono, caixa alta. Ex.: "Nível". */
  rotulo: string;
  /** O número, grande, em serif. */
  valor: ReactNode;
  /** Unidade ou complemento colado no número. Ex.: "2.140 XP". */
  unidade?: string;
  /** Linha de contexto embaixo. Ex.: "360 XP para o nível 5". */
  apoio?: ReactNode;
  className?: string;
}

/**
 * Cartão de métrica do painel: rótulo em mono, número em serif, contexto
 * embaixo. É a régua que o resto da plataforma reusa para mostrar um dado
 * isolado.
 */
export function CartaoMetrica({ rotulo, valor, unidade, apoio, className }: CartaoMetricaProps) {
  return (
    <motion.div
      variants={itemCascata}
      className={cn(
        "flex flex-col gap-2 rounded-card border border-border bg-card p-4 shadow-card md:p-5",
        className
      )}
    >
      <span className="rotulo-mono">{rotulo}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-serif-display text-3xl leading-none text-foreground md:text-4xl">
          {valor}
        </span>
        {unidade && <span className="text-sm text-muted-foreground">{unidade}</span>}
      </div>
      {apoio && <p className="text-xs leading-relaxed text-muted-foreground">{apoio}</p>}
    </motion.div>
  );
}

/** Placeholder do cartão enquanto os números carregam. */
export function CartaoMetricaSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card md:p-5">
      <div className="h-2.5 w-20 animate-skeleton-pulse rounded-full bg-foreground/[0.08]" />
      <div className="h-8 w-16 animate-skeleton-pulse rounded bg-foreground/[0.08]" />
      <div className="h-2.5 w-28 animate-skeleton-pulse rounded-full bg-foreground/[0.06]" />
    </div>
  );
}
