import { useRef } from "react";
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

/* Brand palette from style guide */
const brand = {
  900: "#738925",
  800: "#889C2D",
  700: "#9EB038",
  600: "#AFC040",
  500: "#BCC95D",
  400: "#C8D27B",
  300: "#D9DFA1",
  200: "#E9EBC6",
  100: "#F6F7E9",
  text: "#0D0D0D",
  textSec: "rgba(13,13,13,0.87)",
  textMuted: "rgba(13,13,13,0.5)",
  textFaint: "rgba(13,13,13,0.3)",
};

const statusIcon = {
  concluida: <CheckCircle2 className="h-4 w-4" style={{ color: brand[900] }} />,
  em_andamento: <Loader2 className="h-4 w-4 animate-spin" style={{ color: brand[900] }} />,
  pendente: <Circle className="h-4 w-4" style={{ color: brand.textFaint }} />,
};

const statusDotStyle = {
  concluida: { borderColor: brand[900], backgroundColor: `${brand[700]}40` },
  em_andamento: { borderColor: brand[800], backgroundColor: `${brand[700]}30` },
  pendente: { borderColor: `${brand[900]}30`, backgroundColor: `${brand[900]}10` },
};

const statusLabel: Record<string, string> = {
  concluida: "Concluída",
  em_andamento: "Em andamento",
  pendente: "Pendente",
};

const statusBadgeStyle: Record<string, React.CSSProperties> = {
  concluida: { backgroundColor: `${brand[900]}25`, color: brand.text },
  em_andamento: { backgroundColor: `${brand[900]}15`, color: brand.textSec },
  pendente: { backgroundColor: `${brand[900]}10`, color: brand.textMuted },
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
    <Card
      className="relative overflow-hidden rounded-xl border-0 p-6 md:p-8"
      style={{ backgroundColor: brand[100] }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: brand.textMuted }}
          >
            Progresso geral
          </p>
          <h2 className="text-2xl md:text-3xl font-bold mt-1" style={{ color: brand.text }}>
            RoadMap
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black" style={{ color: brand.text }}>
            {progressoGeral}%
          </span>
          <span className="text-sm font-medium" style={{ color: brand.textMuted }}>
            {concluidas}/{etapas.length} etapas
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="mb-10 relative h-2 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: brand[200] }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: brand[900] }}
          initial={{ width: 0 }}
          animate={{ width: `${progressoGeral}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Vertical Timeline */}
      <div ref={containerRef} className="relative">
        {/* Static track line */}
        <div
          className="absolute left-[15px] md:left-[19px] top-0 bottom-0 w-[2px]"
          style={{ backgroundColor: brand[300] }}
        />

        {/* Animated beam */}
        <motion.div
          className="absolute left-[15px] md:left-[19px] top-0 w-[2px]"
          style={{ backgroundColor: brand[700], height: beamHeight } as any}
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
                  className="relative z-10 mt-1 flex h-[32px] w-[32px] md:h-[40px] md:w-[40px] shrink-0 items-center justify-center rounded-full border-2 transition-all group-hover:scale-110"
                  style={statusDotStyle[cfg] || statusDotStyle.pendente}
                >
                  {statusIcon[cfg] || statusIcon.pendente}
                </div>

                <div
                  className="flex-1 rounded-lg transition-colors p-4 mb-4"
                  style={{ backgroundColor: "#FFFFFF", border: `1px solid ${brand[300]}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: brand.textMuted }}
                        >
                          Etapa {etapa.numero_etapa}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={statusBadgeStyle[cfg] || statusBadgeStyle.pendente}
                        >
                          {statusLabel[cfg] || "Pendente"}
                        </span>
                      </div>
                      <h3
                        className="text-sm md:text-base font-bold leading-tight"
                        style={{ color: brand.text }}
                      >
                        {etapa.titulo}
                      </h3>

                      {/* Progress bar per stage */}
                      <div className="mt-3 flex items-center gap-3">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: brand[200] }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: brand[900] }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progresso}%` }}
                            transition={{ duration: 0.8, delay: index * 0.08 }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold min-w-[32px] text-right"
                          style={{
                            color:
                              progresso >= 100
                                ? brand[900]
                                : progresso > 0
                                ? brand.textSec
                                : brand.textFaint,
                          }}
                        >
                          {progresso}%
                        </span>
                      </div>

                      {entregas.length > 0 && (
                        <p
                          className="text-[11px] font-medium mt-2"
                          style={{ color: brand.textMuted }}
                        >
                          {entregasConcluidas}/{entregas.length} entregas concluídas
                        </p>
                      )}
                    </div>

                    <ChevronRight
                      className="h-4 w-4 mt-1 shrink-0 transition-colors"
                      style={{ color: brand.textFaint }}
                    />
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
