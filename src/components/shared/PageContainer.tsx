import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** "narrow" centra em max-w-3xl pra páginas de leitura focada (configs, formulários) */
  size?: "default" | "narrow";
}

/**
 * Container padrão das páginas internas. Conteúdo expande até a largura
 * disponível do <main> (que é flex-1 dentro do MainLayout — adapta quando
 * sidebar está aberta ou colapsada), com paddings laterais progressivos
 * por breakpoint. Sem max-w fixo pra default — usar size="narrow" pra
 * conteúdo de leitura focada (texto/formulário) que pede coluna mais estreita.
 */
export function PageContainer({ children, className, size = "default" }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background">
      <main
        className={cn(
          "w-full space-y-6 px-4 pb-10 md:space-y-8 md:px-6 md:pb-14 lg:space-y-10 lg:px-10",
          size === "narrow" && "mx-auto max-w-3xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
