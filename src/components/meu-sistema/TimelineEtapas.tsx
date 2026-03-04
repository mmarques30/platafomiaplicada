import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface TimelineEtapasProps {
  etapas: EtapaBusiness[];
  entregasPorEtapa: Record<string, EntregaBusiness[]>;
  calcularProgressoEtapa: (etapaId: string) => number;
}

const statusIcon = {
  concluida: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
  em_andamento: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
  pendente: <Circle className="h-5 w-5 text-white/30" />,
};

const statusRing = {
  concluida: "ring-emerald-400/60 bg-emerald-400/15",
  em_andamento: "ring-primary/60 bg-primary/15",
  pendente: "ring-white/20 bg-white/5",
};

function RoadmapSparkline({ data }: { data: number[] }) {
  const chartData = useMemo(() => data.map((v, i) => ({ v, i })), [data]);
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="roadmap-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke="#4ade80"
          strokeWidth={2}
          fill="url(#roadmap-grad)"
          dot={false}
          isAnimationActive
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TimelineEtapas({ etapas, entregasPorEtapa, calcularProgressoEtapa }: TimelineEtapasProps) {
  const navigate = useNavigate();

  if (!etapas.length) return null;

  const concluidas = etapas.filter((e) => e.status === "concluida").length;
  const progressoGeral = Math.round((concluidas / etapas.length) * 100);

  // Build sparkline from cumulative progress
  const sparkData = useMemo(() => {
    return etapas.map((_, i) => {
      const done = etapas.slice(0, i + 1).filter((e) => e.status === "concluida").length;
      return Math.round((done / etapas.length) * 100);
    });
  }, [etapas]);

  return (
    <Card className="relative overflow-hidden rounded-xl border-0 bg-[hsl(var(--chart-4))] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-white/50">Progresso geral</p>
          <h2 className="text-xl font-bold text-white">RoadMap</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{progressoGeral}%</p>
          <p className="text-xs text-white/50">{concluidas}/{etapas.length} etapas</p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-6">
        <RoadmapSparkline data={sparkData} />
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="relative h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressoGeral}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Horizontal timeline */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="relative flex items-start gap-0 min-w-max">
          {etapas.map((etapa, index) => {
            const cfg = etapa.status as keyof typeof statusIcon;
            const progresso = calcularProgressoEtapa(etapa.id);
            const isLast = index === etapas.length - 1;

            return (
              <motion.div
                key={etapa.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="flex flex-col items-center cursor-pointer group"
                style={{ minWidth: 120 }}
                onClick={() => navigate(`/meu-sistema/fase/${etapa.id}`)}
              >
                {/* Node row with connector */}
                <div className="flex items-center w-full">
                  {/* Left connector */}
                  {index > 0 && (
                    <div
                      className={`h-[2px] flex-1 ${
                        etapa.status === "concluida" || etapas[index - 1]?.status === "concluida"
                          ? "bg-emerald-400/50"
                          : "bg-white/10"
                      }`}
                    />
                  )}
                  {index === 0 && <div className="flex-1" />}

                  {/* Circle node */}
                  <div
                    className={`relative w-10 h-10 rounded-full ring-2 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      statusRing[cfg] || statusRing.pendente
                    }`}
                  >
                    {statusIcon[cfg] || statusIcon.pendente}
                  </div>

                  {/* Right connector */}
                  {!isLast && (
                    <div
                      className={`h-[2px] flex-1 ${
                        etapa.status === "concluida" ? "bg-emerald-400/50" : "bg-white/10"
                      }`}
                    />
                  )}
                  {isLast && <div className="flex-1" />}
                </div>

                {/* Labels */}
                <div className="mt-3 text-center px-1 max-w-[110px]">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                    Etapa {etapa.numero_etapa}
                  </p>
                  <p className="text-xs font-semibold text-white/90 leading-tight mt-0.5 line-clamp-2 group-hover:text-primary transition-colors">
                    {etapa.titulo}
                  </p>
                  <p className={`text-[10px] mt-1 font-medium ${
                    progresso >= 100 ? "text-emerald-400" : progresso > 0 ? "text-white/60" : "text-white/30"
                  }`}>
                    {progresso}%
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
