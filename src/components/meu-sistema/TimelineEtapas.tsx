import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ptBR } from "date-fns/locale";
import { motion, useScroll, useTransform } from "framer-motion";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface TimelineEtapasProps {
  etapas: EtapaBusiness[];
  entregasPorEtapa: Record<string, EntregaBusiness[]>;
  calcularProgressoEtapa: (etapaId: string) => number;
}

const statusConfig = {
  concluida: { badge: "Concluída", dotClass: "bg-green-500 shadow-green-500/40" },
  em_andamento: { badge: "Em andamento", dotClass: "bg-primary shadow-primary/40" },
  pendente: { badge: "Pendente", dotClass: "bg-muted-foreground/40 shadow-none" },
};

export function TimelineEtapas({ etapas, entregasPorEtapa, calcularProgressoEtapa }: TimelineEtapasProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const beamHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (!etapas.length) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">RoadMap</h2>

      <div ref={containerRef} className="relative pb-10">
        {/* Background line */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-[2px] bg-border" />

        {/* Animated scroll beam */}
        <motion.div
          className="absolute left-4 md:left-8 top-0 w-[2px] bg-primary origin-top"
          style={{ height: beamHeight }}
        />

        <div className="space-y-8 md:space-y-12">
          {etapas.map((etapa, index) => {
            const cfg = statusConfig[etapa.status] || statusConfig.pendente;
            const entregas = entregasPorEtapa[etapa.id] || [];
            const progresso = calcularProgressoEtapa(etapa.id);
            const concluidas = entregas.filter((e) => e.status === "concluida").length;

            return (
              <motion.div
                key={etapa.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative pl-12 md:pl-20 cursor-pointer group"
                onClick={() => navigate(`/meu-sistema/fase/${etapa.id}`)}
              >
                {/* Dot */}
                <div
                  className={`absolute left-[10px] md:left-[26px] top-1.5 h-4 w-4 rounded-full border-2 border-background shadow-lg z-10 ${cfg.dotClass}`}
                />

                {/* Content */}
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Etapa {etapa.numero_etapa}
                      </p>
                      <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {etapa.titulo}
                      </h3>
                    </div>
                    <Badge
                      variant={etapa.status === "concluida" ? "default" : "secondary"}
                      className="shrink-0 self-start text-xs"
                    >
                      {cfg.badge}
                    </Badge>
                  </div>

                  {/* Objective */}
                  {etapa.objetivo && (
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {etapa.objetivo}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {etapa.data_prevista && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Prevista: {format(parseISO(etapa.data_prevista), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    )}
                    {etapa.data_conclusao && (
                      <span className="flex items-center gap-1.5 text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Concluída: {format(parseISO(etapa.data_conclusao), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>

                  {/* Deliveries progress */}
                  {entregas.length > 0 && (
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {concluidas}/{entregas.length} entregas
                        </span>
                        <span className="font-semibold text-foreground">{progresso}%</span>
                      </div>
                      <Progress value={progresso} className="h-1.5" />
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver detalhes <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
