import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  primary: string;
  /** Texto secundário em itálico color accent ao lado do principal */
  secondary?: string;
  /** Eyebrow opcional acima do título */
  eyebrow?: string;
  /** Numeração opcional. Se ausente, eyebrow vira só texto */
  index?: number;
  /** Ícone à esquerda (compat) */
  icon?: ReactNode;
  /** Linha de apoio sob o título */
  description?: ReactNode;
  className?: string;
}

/** Título padrão das páginas internas. */
export function PageTitle({
  primary,
  secondary,
  icon,
  description,
  className,
}: PageTitleProps) {
  return (
    <header className={cn("space-y-3", className)}>
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
