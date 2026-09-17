import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { useTrilhasEmAndamento } from "@/hooks/useEvolucao";
import { progresso as variantesProgresso } from "@/lib/motion";

/**
 * O atalho mais curto do painel: a trilha que a pessoa mexeu por último,
 * com o próximo vídeo já apontado. Some quando não há nada em andamento.
 */
export function ContinuarDeOndeParou() {
  const navigate = useNavigate();
  const { data: trilhas, isLoading } = useTrilhasEmAndamento();

  const retomar = useMemo(() => {
    if (!trilhas?.length) return null;
    const comVideo = trilhas.filter((t) => t.proximoVideoId);
    if (!comVideo.length) return null;
    return [...comVideo].sort((a, b) => {
      const da = a.ultimaVisualizacao ? new Date(a.ultimaVisualizacao).getTime() : 0;
      const db = b.ultimaVisualizacao ? new Date(b.ultimaVisualizacao).getTime() : 0;
      return db - da;
    })[0];
  }, [trilhas]);

  if (isLoading) {
    return <div className="h-[132px] animate-skeleton-pulse rounded-card bg-card" />;
  }

  if (!retomar) return null;

  return (
    <section className="rounded-card border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40 md:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <span className="rotulo-mono">Continue de onde parou</span>
        <span className="rotulo-mono">
          {retomar.videosCompletos} de {retomar.totalVideos} aulas
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/videos/${retomar.proximoVideoId}`)}
        className="group flex w-full items-center gap-4 text-left"
      >
        <span className="relative flex h-[68px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
          <span className="absolute inset-0 dot-grid-bg opacity-50" />
          <Play
            className="relative h-7 w-7 text-primary transition-transform duration-200 group-hover:scale-110"
            strokeWidth={1.5}
            fill="currentColor"
          />
        </span>

        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="rotulo-mono block truncate">{retomar.titulo}</span>
          <span className="line-clamp-2 block text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary md:text-base">
            {retomar.proximoVideo}
          </span>
        </span>
      </button>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          variants={variantesProgresso(retomar.progressoPercent)}
          initial="inicial"
          animate="ativo"
          className="h-full rounded-full bg-primary"
        />
      </div>
    </section>
  );
}
