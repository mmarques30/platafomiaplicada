import { useState } from "react";
import { ArrowUpRight, Check, Copy, Cpu } from "lucide-react";
import { toast } from "sonner";

import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ChipMeta } from "./ChipsRecurso";

interface IACopieUseCardProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    conteudo?: string | null;
    ia_recomendada?: string | null;
  };
  onClick: () => void;
}

/** As primeiras linhas do modelo, sem as marcações que só servem na íntegra. */
function primeirasLinhas(conteudo: string, quantas = 7): string {
  return conteudo
    .split("\n")
    .map((l) => l.replace(/^#{1,6}\s*/, "").replace(/\*\*/g, ""))
    .filter((l) => l.trim().length > 0)
    .slice(0, quantas)
    .join("\n");
}

/**
 * Um cartão de modelo pronto.
 *
 * O cartão dizia o título, três linhas de descrição e a categoria. Nada
 * disso responde a pergunta que a pessoa faz ao passar o olho numa grade de
 * modelos prontos, que é "o que é este aqui, afinal". Para descobrir era
 * preciso abrir, ler o modal e fechar — um por um.
 *
 * Agora o próprio modelo aparece no cartão: as primeiras linhas do conteúdo,
 * em mono, com esmaecida no pé para deixar claro que continua. É o mesmo
 * truque do trecho de código: não se lê inteiro, mas se reconhece na hora se
 * é um prompt, um fluxo ou um roteiro, e se tem a ver com o que se procura.
 *
 * E o botão de copiar vem junto. A biblioteca chama "copie e use": obrigar a
 * abrir o modal para copiar era uma porta no meio do caminho.
 */
export function IACopieUseCard({ ia, onClick }: IACopieUseCardProps) {
  const [copiado, setCopiado] = useState(false);
  const preview = ia.conteudo ? primeirasLinhas(ia.conteudo) : "";

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

      <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
        {ia.descricao}
      </p>

      {preview && (
        <div className="relative flex-1 overflow-hidden rounded-xl border border-border/70 bg-surface/60 p-3">
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-[1.6] text-muted-foreground/90">
            {preview}
          </pre>
          {/* A esmaecida no pé diz "continua" sem precisar de reticências. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <ChipMeta>{ia.categoria}</ChipMeta>
        {ia.ia_recomendada && (
          <ChipMeta>
            <Cpu className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {ia.ia_recomendada}
          </ChipMeta>
        )}

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
    </article>
  );
}
