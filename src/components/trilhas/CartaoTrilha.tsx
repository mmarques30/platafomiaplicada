import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Lock } from "lucide-react";

import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { itemCascata, progresso as variantesProgresso } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CartaoTrilhaProps {
  id: string;
  titulo: string;
  ordem: number;
  imagemUrl?: string | null;
  classificacao?: string | null;
  ferramentas?: string[];
  totalVideos: number;
  videosConcluidos: number;
  apenasPro?: boolean;
}

/**
 * Card de trilha. Cada informação aparece uma vez só: a capa é imagem ou arte
 * da marca, o título é o título, e o progresso é a barra. O estado (começar,
 * continuar, concluída) vem do próprio progresso, não de um selo à parte.
 */
export function CartaoTrilha({
  id,
  titulo,
  ordem,
  imagemUrl,
  classificacao,
  ferramentas,
  totalVideos,
  videosConcluidos,
  apenasPro,
}: CartaoTrilhaProps) {
  const [imgQuebrada, setImgQuebrada] = useState(false);

  const percentual = totalVideos > 0 ? Math.round((videosConcluidos / totalVideos) * 100) : 0;
  const concluida = percentual >= 100;
  const iniciada = percentual > 0 && !concluida;
  const temImagem = !!imagemUrl && !imgQuebrada;

  const acao = concluida ? "Rever" : iniciada ? "Continuar" : "Começar";

  return (
    <motion.article variants={itemCascata} className="h-full">
      <Link
        to={`/trilhas/${id}`}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-card border border-border bg-card shadow-card",
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-elevated"
        )}
      >
        {/* Capa: imagem da trilha ou arte da marca com o número. Nunca texto. */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
          {temImagem ? (
            <img
              src={imagemUrl as string}
              alt=""
              loading="lazy"
              onError={() => setImgQuebrada(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="relative h-full w-full bg-gradient-to-br from-olive/25 via-surface to-card">
              <div className="absolute inset-0 dot-grid-bg opacity-40" />
              <span className="absolute -bottom-4 right-2 font-serif-display text-[104px] leading-none text-foreground/[0.10]">
                {ordem + 1}
              </span>
            </div>
          )}

          <span className="rotulo-mono absolute left-3 top-3 rounded-full bg-chrome/85 px-2.5 py-1 text-chrome-foreground backdrop-blur">
            Trilha {ordem + 1}
          </span>

          <div className="absolute right-3 top-3">
            <FavoriteButton tipo="trilha" itemId={id} variant="icon-only" size="md" />
          </div>

          {apenasPro && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
              <Lock className="h-3 w-3" />
              Pro
            </span>
          )}

          {concluida && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
              <Check className="h-3 w-3" strokeWidth={3} />
              Concluída
            </span>
          )}
        </div>

        {/* Barra de progresso: só aparece quando existe progresso. */}
        {(iniciada || concluida) && (
          <div className="h-1 w-full bg-muted">
            <motion.div
              variants={variantesProgresso(percentual)}
              initial="inicial"
              whileInView="ativo"
              viewport={{ once: true }}
              className="h-full bg-primary"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary md:text-base">
            {titulo}
          </h3>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="rotulo-mono">
              {totalVideos} {totalVideos === 1 ? "aula" : "aulas"}
            </span>
            {classificacao && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="rotulo-mono">{classificacao}</span>
              </>
            )}
          </div>

          {!!ferramentas?.length && (
            <div className="flex flex-wrap gap-1.5">
              {ferramentas.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="rotulo-mono">
              {iniciada || concluida ? `${videosConcluidos} de ${totalVideos}` : "Não começou"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary/70 transition-colors group-hover:text-primary">
              {acao}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
