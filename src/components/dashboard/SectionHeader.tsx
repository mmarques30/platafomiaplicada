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
    <header className={cn("flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-4", className)}>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs font-medium text-brand-strong">{indexPadded}</span>
        <span className="hidden h-px w-6 bg-foreground/30 md:inline-block" />
        <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
          {title}
        </h2>
        <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground md:inline">
          {eyebrow}
        </span>
      </div>
      {description ? (
        <p className="text-xs font-light text-muted-foreground md:text-sm">
          {description}
        </p>
      ) : null}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
