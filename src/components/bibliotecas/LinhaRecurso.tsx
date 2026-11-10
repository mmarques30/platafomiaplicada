import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface LinhaRecursoProps {
  /** Logo, marcador ou ícone. Opcional: a linha funciona sem. */
  marcador?: ReactNode;
  titulo: string;
  /** Linha pequena acima do título, quando o título tem um prefixo. */
  sobretitulo?: string;
  descricao?: string | null;
  /** Os chips: categoria, nível, ferramenta. */
  meta?: ReactNode;
  /** Bloco da direita: nota, valor, data. */
  direita?: ReactNode;
  /** Ações em ícone. Aparecem no hover e no foco pelo teclado. */
  acoes?: ReactNode;
  aoClicar: () => void;
  className?: string;
}

/**
 * A linha das listas densas.
 *
 * As listas eram um bloco único com divisórias de um fio entre as
 * linhas, cada linha com um ícone dentro de um quadrado lime, a
 * descrição cortada no meio de uma palavra e dois botões sólidos à
 * direita. Nove linhas assim viravam uma parede: tudo com o mesmo
 * peso, nada para o olho pousar.
 *
 * Aqui cada linha é uma superfície própria, separada por espaço em vez
 * de linha, e sobe um pouco ao passar o mouse. A linha inteira é o
 * alvo de clique, então não precisa de um botão "Ver" para dizer o
 * óbvio. As ações secundárias só aparecem no hover ou no foco, o que
 * tira da tela em repouso meia dúzia de ícones por linha.
 *
 * A descrição usa `line-clamp-1`, que corta na linha inteira, e não
 * `truncate` com largura calculada, que cortava no meio da palavra.
 */
export function LinhaRecurso({
  marcador,
  titulo,
  sobretitulo,
  descricao,
  meta,
  direita,
  acoes,
  aoClicar,
  className,
}: LinhaRecursoProps) {
  return (
    <li>
      <div
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
          "superficie superficie-interativa group flex cursor-pointer items-center gap-4 px-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:px-5",
          className,
        )}
      >
        {marcador && <div className="shrink-0">{marcador}</div>}

        <div className="min-w-0 flex-1">
          {sobretitulo && (
            <span className="rotulo-mono mb-0.5 block text-[10px] text-primary">{sobretitulo}</span>
          )}
          <h3 className="truncate text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {titulo}
          </h3>
          {descricao && (
            <p className="mt-0.5 line-clamp-1 text-[13px] leading-relaxed text-muted-foreground">
              {descricao}
            </p>
          )}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-1.5">{meta}</div>}
        </div>

        {direita && <div className="hidden shrink-0 text-right sm:block">{direita}</div>}

        <div className="flex shrink-0 items-center gap-0.5">
          {acoes && (
            <div
              className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              {acoes}
            </div>
          )}
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </div>
      </div>
    </li>
  );
}

/** O contêiner das linhas: espaço entre elas, não divisória. */
export function ListaRecursos({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("flex flex-col gap-2", className)}>{children}</ul>;
}
