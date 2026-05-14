import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  /** Número da seção (renderiza como "01") */
  index: number;
  /** Texto curto do eyebrow em CAPS (ex: "BRIEFING DA SEMANA") */
  eyebrow: string;
  /** Título grande da seção. Pode receber <em> pra itálico serif. */
  title: ReactNode;
  /** Linha de apoio opcional abaixo do título */
  description?: ReactNode;
  /** Slot à direita (CTA, badge, controle) */
  actions?: ReactNode;
  className?: string;
}

/**
 * Header de seção no padrão da LP academy.iaplicada.com:
 *
 *   ── 01 — O PROBLEMA
 *
 *   Consumir conteúdo
 *   sobre IA não é aplicar IA.
 *
 * Numeração em mono verde, título em Fraunces (serif), itálico nas
 * palavras de destaque via <em>.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  const indexPadded = String(index).padStart(2, "0");

  return (
    <header className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-3">
        <div className="lp-eyebrow">
          <span className="font-mono text-primary">{indexPadded}</span>
          <span>—</span>
          <span>{eyebrow}</span>
        </div>
        <h2 className="font-serif-display text-3xl leading-[1.05] tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-prose text-sm font-light text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
