import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2, Calendar } from "lucide-react";
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
  if (!etapas.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        Metodologia APLICA — Timeline do Projeto
      </h2>

      <div className="relative">
        {etapas.map((etapa, index) => {
          const cfg = statusConfig[etapa.status] || statusConfig.pendente;
          const Icon = cfg.icon;
          const entregas = entregasPorEtapa[etapa.id] || [];
          const progresso = calcularProgressoEtapa(etapa.id);
          const isLast = index === etapas.length - 1;

          return (
            <div key={etapa.id} className="relative flex gap-4">
              {/* Vertical line */}
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`h-4 w-4 ${etapa.status === 'concluida' ? 'text-primary-foreground' : cfg.color}`} />
                </div>
                {!isLast && (
                  <div className="w-px flex-1 bg-border min-h-[24px]" />
                )}
              </div>

              {/* Card */}
              <Card className="flex-1 mb-4 border-border/50">
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

                  {/* Dates */}
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

                  {/* Progress bar */}
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
