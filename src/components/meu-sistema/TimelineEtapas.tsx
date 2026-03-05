import { useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface TimelineEtapasProps {
  etapas: EtapaBusiness[];
  entregasPorEtapa: Record<string, EntregaBusiness[]>;
  calcularProgressoEtapa: (etapaId: string) => number;
}

const statusIcon = {
  concluida: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  em_andamento: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  pendente: <Circle className="h-4 w-4 text-white/30" />,
};

const statusDot = {
  concluida: "border-emerald-400 bg-emerald-400/20",
  em_andamento: "border-primary bg-primary/20",
  pendente: "border-white/20 bg-white/5",
};

export function TimelineEtapas({ etapas, entregasPorEtapa, calcularProgressoEtapa }: TimelineEtapasProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const concluidas = etapas.filter((e) => e.status === "concluida").length;
  const progressoGeral = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const beamHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (!etapas.length) return null;

  return (
    <Card className="relative overflow-hidden rounded-xl border-0 bg-[hsl(var(--chart-4))] p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-white/50 uppercase tracking-wider">Progresso geral</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">RoadMap</h2>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-lg font-bold text-white">{progressoGeral}%</span>
          <span className="text-sm text-white/40">{concluidas}/{etapas.length} etapas concluídas</span>
        </div>
        {/* Progress bar */}
        <div className="mt-4 relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressoGeral}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Vertical Timeline */}
      <div ref={containerRef} className="relative">
        {/* Static track line */}
        <div className="absolute left-[15px] md:left-[19px] top-0 bottom-0 w-[2px] bg-white/10" />

        {/* Animated beam */}
        <motion.div
          className="absolute left-[15px] md:left-[19px] top-0 w-[2px] bg-gradient-to-b from-emerald-400 via-emerald-400/60 to-transparent"
          style={{ height: beamHeight }}
        />

        {/* Timeline items */}
        <div className="space-y-8">
          {etapas.map((etapa, index) => {
            const cfg = etapa.status as keyof typeof statusIcon;
            const progresso = calcularProgressoEtapa(etapa.id);
            const entregas = entregasPorEtapa[etapa.id] || [];
            const entregasConcluidas = entregas.filter((e) => e.status === "concluida").length;

            return (
              <motion.div
                key={etapa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex gap-4 md:gap-6 cursor-pointer group"
                onClick={() => navigate(`/meu-sistema/fase/${etapa.id}`)}
              >
                {/* Dot */}
                <div
                  className={`relative z-10 mt-1 flex h-[32px] w-[32px] md:h-[40px] md:w-[40px] shrink-0 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-110 ${
                    statusDot[cfg] || statusDot.pendente
                  }`}
                >
                  {statusIcon[cfg] || statusIcon.pendente}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-1">
                    Etapa {etapa.numero_etapa}
                  </p>
                  <h3 className="text-sm md:text-base font-semibold text-white/90 group-hover:text-primary transition-colors leading-tight">
                    {etapa.titulo}
                  </h3>

                  {/* Mini progress + entregas info */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 max-w-[140px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-emerald-400/80"
                        initial={{ width: 0 }}
                        animate={{ width: `${progresso}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        progresso >= 100
                          ? "text-emerald-400"
                          : progresso > 0
                          ? "text-white/60"
                          : "text-white/30"
                      }`}
                    >
                      {progresso}%
                    </span>
                  </div>

                  {entregas.length > 0 && (
                    <p className="text-[11px] text-white/30 mt-1.5">
                      {entregasConcluidas}/{entregas.length} entregas
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
