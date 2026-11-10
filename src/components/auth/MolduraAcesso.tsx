import { ReactNode } from "react";

import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";
import { cn } from "@/lib/utils";

interface MolduraAcessoProps {
  /** Rótulo pequeno em mono acima do título. */
  etiqueta?: string;
  titulo: string;
  /** Uma linha de apoio. Nunca um parágrafo. */
  apoio?: ReactNode;
  children: ReactNode;
  /** Rodapé pequeno, como o aviso de expiração do link. */
  rodape?: ReactNode;
  className?: string;
}

/**
 * A moldura das telas de acesso que não são o login.
 *
 * Redefinir senha, link expirado e confirmação viviam com cores escritas à
 * mão — `#151515` de fundo, `#1a1a1a` no card, `#8a9a31` no hover do botão —
 * e nenhuma delas é um token da marca. Eram as únicas telas da plataforma
 * fora do design system, e quem chegava nelas vindo do login via outro
 * produto.
 *
 * Esta moldura dá a elas o mesmo fundo, a mesma tipografia e a mesma marca do
 * login. O que não vem junto são as folhas líquidas: elas são o gesto de
 * chegada e ficam só na porta de entrada. Aqui a pessoa veio resolver uma
 * coisa, não ser recebida.
 */
export function MolduraAcesso({
  etiqueta,
  titulo,
  apoio,
  children,
  rodape,
  className,
}: MolduraAcessoProps) {
  return (
    <div className="ia-login">
      <div className="ia-login-fundo" aria-hidden="true">
        <div className="ia-login-veu" />
        <div className="ia-login-grao" />
      </div>

      <div className="ia-login-conteudo">
        <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className={cn("w-full max-w-[440px]", className)}>
            <img src={logoIAplicada} alt="IAplicada" className="h-7 w-auto md:h-8" />

            <header className="mt-10">
              {etiqueta && <span className="ia-login-id">{etiqueta}</span>}
              <h1 className="ia-login-titulo mt-3 text-[2rem] md:text-[2.25rem]">{titulo}</h1>
              {apoio && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{apoio}</p>
              )}
            </header>

            <div className="mt-9">{children}</div>

            {rodape && (
              <p className="mt-8 text-xs leading-relaxed text-muted-foreground/70">{rodape}</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
