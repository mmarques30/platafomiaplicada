import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { useTrilhasEmAndamento } from "@/hooks/useEvolucao";
import { listaCascata, itemCascata, progresso as variantesProgresso, aoMontar } from "@/lib/motion";

const LIMITE = 4;

/**
 * As trilhas que já começaram, com a barra animando do zero até o valor.
 * Some quando não há nada em andamento — quem ainda não começou vê o convite
 * para abrir a lista completa.
 */
export function SuasTrilhas() {
  const navigate = useNavigate();
  const { data: trilhas, isLoading } = useTrilhasEmAndamento();

  if (isLoading) {
    return <div className="h-[220px] animate-skeleton-pulse rounded-card bg-card" />;
  }

  const emAndamento = trilhas?.slice(0, LIMITE) ?? [];

  return (
    <section className="rounded-card border border-border bg-card p-4 shadow-card md:p-5">
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
        <motion.ul variants={listaCascata} {...aoMontar} className="flex flex-col gap-4">
          {emAndamento.map((trilha) => (
            <motion.li key={trilha.id} variants={itemCascata}>
              <Link to={`/trilhas/${trilha.id}`} className="group block space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {trilha.titulo}
                  </span>
                  <span className="rotulo-mono shrink-0">{trilha.progressoPercent}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    variants={variantesProgresso(trilha.progressoPercent)}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
