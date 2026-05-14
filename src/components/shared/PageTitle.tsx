import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  /** Título principal (será renderizado em Fraunces serif) */
  primary: string;
  /** Texto secundário italico ao lado do principal (também Fraunces, em cor accent) */
  secondary?: string;
  /** Eyebrow opcional acima do título — pequeno CAPS com tracking, no padrão "01 — TÍTULO" da LP */
  eyebrow?: string;
  /** Numeração opcional do eyebrow (renderiza como "01 — eyebrow"). Se ausente, eyebrow vira só texto */
  index?: number;
  /** Ícone à esquerda (mantido por compat — recomendado evitar; LP é mais editorial) */
  icon?: ReactNode;
  /** Linha de apoio sob o título */
  description?: ReactNode;
  className?: string;
}

/**
 * Título de página interno no padrão da LP academy.iaplicada.com:
 *
 *   ── 01 — APRENDER
 *
 *   Trilhas *de aprendizado*
 *   Descrição opcional aqui.
 *
 * Substituiu o estilo anterior (h1 sans com underline gradient) por
 * Fraunces serif + secondary em itálico color accent, alinhado com
 * "Aplicar IA *de verdade*" da LP. API retrocompatível: continua
 * aceitando `primary` + `secondary` opcional.
 */
export function PageTitle({
  primary,
  secondary,
  eyebrow,
  index,
  icon,
  description,
  className,
}: PageTitleProps) {
  const indexPadded = index !== undefined ? String(index).padStart(2, "0") : null;

  return (
    <header className={cn("space-y-3", className)}>
      {(eyebrow || indexPadded) && (
        <div className="lp-eyebrow">
          {indexPadded && <span className="font-mono text-primary">{indexPadded}</span>}
          {indexPadded && eyebrow && <span>—</span>}
          {eyebrow && <span>{eyebrow}</span>}
        </div>
      )}
      <h1 className="flex items-baseline gap-3 font-serif-display text-3xl leading-[1.05] tracking-tight text-foreground md:text-4xl lg:text-5xl">
        {icon && <span className="self-center text-primary">{icon}</span>}
        <span>
          {primary}
          {secondary && (
            <>
              {" "}
              <em className="font-serif-italic text-primary">{secondary}</em>
            </>
          )}
        </span>
      </h1>
      {description && (
        <p className="max-w-prose text-sm font-light text-muted-foreground md:text-base">
          {description}
        </p>
      )}
    </header>
  );
}
