import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { AnelProgresso } from "@/components/graficos";
import { useTrilhasEmAndamento } from "@/hooks/useEvolucao";
import { listaCascata, itemCascata, aoMontar } from "@/lib/motion";

const LIMITE = 4;

/**
 * As trilhas que já começaram.
 *
 * Era uma lista de nomes com um traço de 1px embaixo de cada um, marcando o
 * progresso. Num bloco com quatro trilhas, isso são quatro fios cinzentos com
 * um pedacinho lime: dá para saber que existe progresso, mas não dá para ver
 * quanto sem ler a porcentagem ao lado. O dado mais importante da seção
 * estava no elemento mais fino da tela.
 *
 * Agora cada trilha é um cartão com anel: o arco mostra o quanto já foi, o
 * centro guarda a porcentagem, e embaixo fica a conta de aulas e o que vem a
 * seguir. É a mesma informação, lida de relance em vez de lida por extenso.
 */
export function SuasTrilhas() {
  const navigate = useNavigate();
  const { data: trilhas, isLoading } = useTrilhasEmAndamento();

  if (isLoading) {
    return <div className="h-[220px] animate-skeleton-pulse rounded-[20px] bg-card" />;
  }

  const emAndamento = trilhas?.slice(0, LIMITE) ?? [];

  return (
    <section className="superficie p-4 md:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rotulo-mono">Suas trilhas</span>
        <Link
          to="/trilhas"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          Ver todas
        </Link>
      </div>

      {emAndamento.length === 0 ? (
        <button
          type="button"
          onClick={() => navigate("/trilhas")}
          className="group flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-6 text-left transition-colors hover:border-primary/50"
        >
          <span className="text-sm text-muted-foreground">
            Você ainda não começou nenhuma trilha.
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            strokeWidth={1.75}
          />
        </button>
      ) : (
        <motion.ul
          variants={listaCascata}
          {...aoMontar}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {emAndamento.map((trilha) => (
            <motion.li key={trilha.id} variants={itemCascata}>
              <Link
                to={`/trilhas/${trilha.id}`}
                className="superficie superficie-interativa group flex h-full items-center gap-4 p-4"
              >
                <AnelProgresso valor={trilha.progressoPercent} tamanho={64} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {trilha.titulo}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono tabular-nums text-foreground">
                      {trilha.videosCompletos}
                    </span>{" "}
                    de {trilha.totalVideos} aulas
                  </p>
                  {trilha.proximoVideo && (
                    <p className="mt-1.5 truncate text-[11px] text-muted-foreground/80">
                      A seguir: {trilha.proximoVideo}
                    </p>
                  )}
                </div>

                <ArrowUpRight
                  className="h-4 w-4 shrink-0 self-start text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
