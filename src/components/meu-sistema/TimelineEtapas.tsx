import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2, Calendar, Map } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface TimelineEtapasProps {
  etapas: EtapaBusiness[];
  entregasPorEtapa: Record<string, EntregaBusiness[]>;
  calcularProgressoEtapa: (etapaId: string) => number;
}

const statusConfig = {
  concluida: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary", badge: "Concluída" },
  em_andamento: { icon: Loader2, color: "text-primary", bg: "bg-primary/20 border-2 border-primary", badge: "Em andamento" },
  pendente: { icon: Circle, color: "text-muted-foreground/40", bg: "bg-muted", badge: "Pendente" },
};

export function TimelineEtapas({ etapas, entregasPorEtapa, calcularProgressoEtapa }: TimelineEtapasProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [lineHeight, setLineHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateLine = useCallback(() => {
    if (activeIndex < 0 || !containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const firstNode = nodeRefs.current[0];
    const activeNode = nodeRefs.current[activeIndex];
    if (!firstNode || !activeNode) return;

    const start = firstNode.getBoundingClientRect().top - containerRect.top + 16;
    const end = activeNode.getBoundingClientRect().top - containerRect.top + 16;
    setLineHeight(end - start);
  }, [activeIndex]);

  useEffect(() => {
    updateLine();
  }, [activeIndex, updateLine]);

  useEffect(() => {
    const nodes = nodeRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-index") || "0");
            setActiveIndex((prev) => Math.max(prev, idx));
          }
        });
      },
      { threshold: 0.5 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [etapas]);

  if (!etapas.length) return null;

  const firstNodeTop = 16; // center of first node (h-8 / 2)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Map className="h-5 w-5 text-primary" />
        RoadMap
      </h2>

      <div className="relative" ref={containerRef}>
        {/* Background line */}
        {etapas.length > 1 && (
          <div
            className="absolute left-4 w-0.5 bg-border"
            style={{
              top: `${firstNodeTop}px`,
              bottom: "16px",
            }}
          />
        )}

        {/* Animated fill line */}
        {etapas.length > 1 && lineHeight > 0 && (
          <div
            className="absolute left-4 w-0.5 bg-primary transition-all duration-700 ease-out"
            style={{
              top: `${firstNodeTop}px`,
              height: `${lineHeight}px`,
            }}
          />
        )}

        {etapas.map((etapa, index) => {
          const cfg = statusConfig[etapa.status] || statusConfig.pendente;
          const Icon = cfg.icon;
          const entregas = entregasPorEtapa[etapa.id] || [];
          const progresso = calcularProgressoEtapa(etapa.id);
          const isActive = index <= activeIndex;

          return (
            <div
              key={etapa.id}
              data-index={index}
              ref={(el) => { nodeRefs.current[index] = el; }}
              className={`relative flex gap-4 transition-all duration-500 ${
                isActive ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2"
              }`}
            >
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${
                    isActive ? cfg.bg : "bg-muted"
                  } ${isActive ? "scale-100" : "scale-90"}`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors duration-500 ${
                      isActive
                        ? etapa.status === "concluida"
                          ? "text-primary-foreground"
                          : cfg.color
                        : "text-muted-foreground/40"
                    }`}
                  />
                </div>
              </div>

              {/* Card */}
              <Card className={`flex-1 mb-4 transition-all duration-500 ${
                isActive ? "border-border/50 shadow-sm" : "border-border/20"
              }`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Etapa {etapa.numero_etapa}</p>
                      <h3 className="font-semibold">{etapa.titulo}</h3>
                    </div>
                    <Badge
                      variant={etapa.status === "concluida" ? "default" : "secondary"}
                      className="shrink-0 text-xs"
                    >
                      {cfg.badge}
                    </Badge>
                  </div>

                  {etapa.objetivo && (
                    <p className="text-sm text-muted-foreground">{etapa.objetivo}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {etapa.data_prevista && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Prevista: {format(parseISO(etapa.data_prevista), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    )}
                    {etapa.data_conclusao && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        Concluída: {format(parseISO(etapa.data_conclusao), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>

                  {entregas.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {entregas.filter((e) => e.status === "concluida").length}/{entregas.length} entregas
                        </span>
                        <span className="font-medium">{progresso}%</span>
                      </div>
                      <Progress value={progresso} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
