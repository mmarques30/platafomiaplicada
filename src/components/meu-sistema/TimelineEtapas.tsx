import { useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2, ChevronRight } from "lucide-react";
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
  concluida: <CheckCircle2 className="h-4 w-4 text-emerald-950" />,
  em_andamento: <Loader2 className="h-4 w-4 text-emerald-950 animate-spin" />,
  pendente: <Circle className="h-4 w-4 text-emerald-950/40" />,
};

const statusDot = {
  concluida: "border-emerald-950 bg-emerald-900/30",
  em_andamento: "border-emerald-800 bg-emerald-800/20",
  pendente: "border-emerald-800/30 bg-emerald-900/10",
};

const statusLabel: Record<string, string> = {
  concluida: "Concluída",
  em_andamento: "Em andamento",
  pendente: "Pendente",
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
    <Card className="relative overflow-hidden rounded-xl border-0 bg-emerald-400 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-emerald-950/50 uppercase tracking-widest">
            Progresso geral
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-950 mt-1">RoadMap</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-emerald-950">{progressoGeral}%</span>
          <span className="text-sm font-medium text-emerald-950/50">
            {concluidas}/{etapas.length} etapas
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-10 relative h-2 w-full rounded-full bg-emerald-950/10 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-950"
          initial={{ width: 0 }}
          animate={{ width: `${progressoGeral}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Vertical Timeline */}
      <div ref={containerRef} className="relative">
        {/* Static track line */}
        <div className="absolute left-[15px] md:left-[19px] top-0 bottom-0 w-[2px] bg-emerald-950/10" />

        {/* Animated beam */}
        <motion.div
          className="absolute left-[15px] md:left-[19px] top-0 w-[2px] bg-emerald-950/40"
          style={{ height: beamHeight }}
        />

        {/* Timeline items */}
        <div className="space-y-0">
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
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative flex gap-4 md:gap-6 cursor-pointer group"
                onClick={() => navigate(`/meu-sistema/fase/${etapa.id}`)}
              >
                {/* Dot */}
                <div
                  className={`relative z-10 mt-1 flex h-[32px] w-[32px] md:h-[40px] md:w-[40px] shrink-0 items-center justify-center rounded-full border-2 transition-all group-hover:scale-110 group-hover:shadow-lg ${
                    statusDot[cfg] || statusDot.pendente
                  }`}
                >
                  {statusIcon[cfg] || statusIcon.pendente}
                </div>

                {/* Content card */}
                <div className="flex-1 rounded-lg bg-emerald-500/40 group-hover:bg-emerald-500/60 transition-colors p-4 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-widest">
                          Etapa {etapa.numero_etapa}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            cfg === "concluida"
                              ? "bg-emerald-950/20 text-emerald-950"
                              : cfg === "em_andamento"
                              ? "bg-emerald-950/10 text-emerald-950/70"
                              : "bg-emerald-950/5 text-emerald-950/40"
                          }`}
                        >
                          {statusLabel[cfg] || "Pendente"}
                        </span>
                      </div>
                      <h3 className="text-sm md:text-base font-bold text-emerald-950 group-hover:text-emerald-950 transition-colors leading-tight">
                        {etapa.titulo}
                      </h3>

                      {/* Progress bar per stage */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-emerald-950/10 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-emerald-950/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${progresso}%` }}
                            transition={{ duration: 0.8, delay: index * 0.08 }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold min-w-[32px] text-right ${
                            progresso >= 100
                              ? "text-emerald-950"
                              : progresso > 0
                              ? "text-emerald-950/70"
                              : "text-emerald-950/30"
                          }`}
                        >
                          {progresso}%
                        </span>
                      </div>

                      {entregas.length > 0 && (
                        <p className="text-[11px] text-emerald-950/40 font-medium mt-2">
                          {entregasConcluidas}/{entregas.length} entregas concluídas
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-emerald-950/30 group-hover:text-emerald-950/60 transition-colors mt-1 shrink-0" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
