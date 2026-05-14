import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Reduz max-width pra páginas com leitura focada (configs, formulários) */
  size?: "default" | "narrow";
}

/**
 * Container padrão das páginas internas. Espelha o ritmo de espaçamento
 * do Dashboard pós-rebrand (PR #8): largura útil até 1600px, paddings
 * laterais que crescem com o breakpoint, top mínimo (chrome cuida).
 *
 * Substitui o pattern repetido `<main className="container py-... px-...">`
 * que estava em ~30 páginas, cada uma com paddings ligeiramente diferentes.
 */
export function PageContainer({ children, className, size = "default" }: PageContainerProps) {
  const maxWidth = size === "narrow" ? "max-w-3xl" : "max-w-[1600px]";
  return (
    <div className="min-h-screen bg-background">
      <main
        className={cn(
          "mx-auto w-full space-y-8 px-4 pb-10 md:space-y-12 md:px-8 md:pb-16 lg:px-12",
          maxWidth,
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
