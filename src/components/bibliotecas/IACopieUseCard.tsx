import { useState } from "react";
import { ArrowUpRight, Check, Copy, Layers } from "lucide-react";
import { toast } from "sonner";

import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ToolLogo } from "@/components/shared/ToolLogo";
import { CapaGerada } from "@/components/shared/CapaGerada";

export interface LogoDaFerramenta {
  logoUrl: string | null;
  linkFerramenta: string | null;
}

interface IACopieUseCardProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    conteudo?: string | null;
    ia_recomendada?: string | null;
  };
  /** Resolve o logo da ferramenta pelo nome, com o cadastro da Biblioteca. */
  logoDe?: (nome: string) => LogoDaFerramenta;
  onClick: () => void;
}

/**
 * Um cartão de modelo pronto.
 *
 * O cartão já teve duas versões erradas. A primeira dizia só título,
 * descrição e categoria, e não respondia "o que é este aqui". A segunda
 * tentou responder mostrando as primeiras linhas do texto do modelo — só que
 * numa grade de doze, doze blocos de texto cinza em mono não se leem: viram
 * textura, e o cartão ficou mais pesado sem ficar mais claro.
 *
 * O que identifica um modelo pronto não é como ele começa, é para que
 * ferramenta ele é e de que tipo ele é. Então a capa mostra isso: o logo da
 * ferramenta, grande, sobre um fundo desenhado a partir do título, com o
 * tipo escrito ao lado. Reconhece-se de relance — "este é um modelo de
 * Claude, da área comercial" — sem ler uma palavra do conteúdo.
 *
 * O botão de copiar fica, porque a biblioteca chama "copie e use" e obrigar
 * a abrir o modal para copiar era uma porta no meio do caminho.
 */
export function IACopieUseCard({ ia, logoDe, onClick }: IACopieUseCardProps) {
  const [copiado, setCopiado] = useState(false);

  const ferramenta = ia.ia_recomendada?.trim() || null;
  const logo = ferramenta && logoDe ? logoDe(ferramenta) : null;

  const copiar = async () => {
    if (!ia.conteudo) return;
    try {
      await navigator.clipboard.writeText(ia.conteudo);
      setCopiado(true);
      toast.success("Modelo copiado");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Abra o modelo e copie de lá.");
    }
  };

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
      className="superficie superficie-interativa group relative flex h-full cursor-pointer flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* A capa: de que ferramenta é, e de que tipo. */}
      <div className="relative h-[96px] w-full shrink-0 overflow-hidden border-b border-border/70">
        <CapaGerada chave={ia.titulo} semSigla />

        <div className="absolute inset-0 flex items-center gap-3 px-4">
          {ferramenta ? (
            <ToolLogo
              logoUrl={logo?.logoUrl ?? null}
              toolName={ferramenta}
              linkFerramenta={logo?.linkFerramenta ?? null}
              size="lg"
              className="border border-border/70 bg-card/80 backdrop-blur"
            />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border/70 bg-card/80 backdrop-blur">
              <Layers className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </span>
          )}

          <span className="min-w-0">
            <span className="rotulo-mono block text-[10px]">{ia.categoria}</span>
            <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
              {ferramenta ?? "Qualquer ferramenta"}
            </span>
          </span>
        </div>

        <div
          className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton tipo="ia_copie_use" itemId={ia.id} variant="icon-only" size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
          {ia.titulo}
        </h3>

        <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
          {ia.descricao}
        </p>

        {/* A categoria já está na capa, em mono. Repetir como chip aqui era
            a mesma palavra duas vezes no mesmo cartão. */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="ml-auto flex items-center gap-1">
            {ia.conteudo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copiar();
                }}
                aria-label={`Copiar o modelo ${ia.titulo}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {copiado ? (
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  <Copy className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                )}
                {copiado ? "Copiado" : "Copiar"}
              </button>
            )}
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
