import { ArrowUpRight, Cpu } from "lucide-react";

import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ChipMeta } from "./ChipsRecurso";

interface IACopieUseCardProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    ia_recomendada?: string | null;
  };
  onClick: () => void;
}

/**
 * Um cartão de modelo pronto.
 *
 * O cartão tinha 220px de altura mínima e o conteúdo era empurrado
 * para as pontas por um `mb-auto`: título em cima, chips embaixo, e um
 * vão morto no meio em todo cartão cujo texto fosse curto. Numa grade
 * de três colunas isso virava uma faixa vazia atravessando a tela.
 *
 * Agora o cartão tem a altura do que carrega, e a grade usa
 * `auto-rows-fr` para os irmãos da mesma linha ficarem iguais. O vão
 * some sem que os cartões percam o alinhamento.
 */
export function IACopieUseCard({ ia, onClick }: IACopieUseCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="superficie superficie-interativa group relative flex h-full cursor-pointer flex-col gap-3 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div
        className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <FavoriteButton tipo="ia_copie_use" itemId={ia.id} variant="icon-only" size="sm" />
      </div>

      <h3 className="line-clamp-2 pr-8 text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
        {ia.titulo}
      </h3>

      <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {ia.descricao}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <ChipMeta>{ia.categoria}</ChipMeta>
        {ia.ia_recomendada && (
          <ChipMeta>
            <Cpu className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {ia.ia_recomendada}
          </ChipMeta>
        )}
        <ArrowUpRight
          className="ml-auto h-4 w-4 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </article>
  );
}
