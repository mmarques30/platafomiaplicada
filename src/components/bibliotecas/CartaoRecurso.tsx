import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { CapaGerada } from "@/components/shared/CapaGerada";
import { cn } from "@/lib/utils";

interface CartaoRecursoProps {
  /** O texto que desenha o fundo da capa. Normalmente o título. */
  chaveCapa: string;
  /** Foto de capa, quando o item tem uma. Na falta dela, a capa é desenhada. */
  imagemUrl?: string | null;
  /** O logo ou ícone da capa, dentro do seu próprio quadro. */
  marcador: ReactNode;
  /** Linha pequena em mono na capa. A categoria, o tipo, a área. */
  capaRotulo?: string | null;
  /** Linha forte na capa, sob o rótulo. A ferramenta, o nome, o nível. */
  capaTitulo?: string | null;
  titulo: string;
  /** Rótulo curto acima do título, quando o título tem prefixo. */
  sobretitulo?: string | null;
  descricao?: string | null;
  /** Chips e ações do rodapé. Vão para a esquerda. */
  rodape?: ReactNode;
  /** Ações à direita do rodapé, antes da seta. */
  acoes?: ReactNode;
  /** O botão de favoritar, no canto da capa. Aparece no hover e no foco. */
  favorito?: ReactNode;
  aoClicar: () => void;
  className?: string;
}

/**
 * O cartão padrão das bibliotecas.
 *
 * Cada lista tinha o seu: prompts com um quadradinho de ícone em cima do
 * título, ferramentas com o logo centralizado e três botões no pé, skills com
 * título e nada mais, modelos com a capa. Quatro linguagens para a mesma
 * coisa — um item de biblioteca que se abre num modal — e nenhuma delas
 * respondia de relance "o que é este aqui" a não ser a dos modelos.
 *
 * Este é o layout dos modelos, generalizado: uma capa baixa com o fundo
 * desenhado a partir do título, o logo ou ícone dentro dela, e duas linhas
 * dizendo de que tipo é e de que ferramenta é. Abaixo, título, descrição e um
 * rodapé para os chips e a ação.
 *
 * O que muda de biblioteca para biblioteca é só o que entra no marcador e nas
 * duas linhas da capa. A forma é a mesma, então varrer uma lista ensina a
 * varrer as outras.
 */
export function CartaoRecurso({
  chaveCapa,
  imagemUrl,
  marcador,
  capaRotulo,
  capaTitulo,
  titulo,
  sobretitulo,
  descricao,
  rodape,
  acoes,
  favorito,
  aoClicar,
  className,
}: CartaoRecursoProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={aoClicar}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          aoClicar();
        }
      }}
      className={cn(
        "superficie superficie-interativa group relative flex h-full cursor-pointer flex-col overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className,
      )}
    >
      <div className="relative h-[96px] w-full shrink-0 overflow-hidden border-b border-border/70">
        {imagemUrl ? (
          <>
            <img
              src={imagemUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* O véu: o marcador e as duas linhas por cima são claros, e a
                foto pode ser clara em qualquer ponto. */}
            <span aria-hidden="true" className="absolute inset-0 bg-card/70" />
          </>
        ) : (
          <CapaGerada chave={chaveCapa} semSigla />
        )}

        <div className="absolute inset-0 flex items-center gap-3 px-4">
          {marcador}
          <span className="min-w-0 flex-1">
            {capaRotulo && <span className="rotulo-mono block text-[10px]">{capaRotulo}</span>}
            {capaTitulo && (
              <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                {capaTitulo}
              </span>
            )}
          </span>
        </div>

        {favorito && (
          <div
            className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {favorito}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {sobretitulo && (
          <span className="-mb-1.5 block text-[11px] font-medium text-primary">{sobretitulo}</span>
        )}

        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
          {titulo}
        </h3>

        {descricao && (
          <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
            {descricao}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {rodape}
          <span className="ml-auto flex items-center gap-1">
            {acoes}
            <ArrowUpRight
              className="h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </article>
  );
}

/** O quadro do marcador na capa: logo, ícone, o que for. */
export function MarcadorCapa({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border/70 bg-card/80 backdrop-blur">
      {children}
    </span>
  );
}
