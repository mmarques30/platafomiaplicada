import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ptBR } from "date-fns/locale";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface TimelineEtapasProps {
  etapas: EtapaBusiness[];
  entregasPorEtapa: Record<string, EntregaBusiness[]>;
  calcularProgressoEtapa: (etapaId: string) => number;
}

const statusConfig = {
  concluida: { badge: "Concluída" },
  em_andamento: { badge: "Em andamento" },
  pendente: { badge: "Pendente" },
};

export function TimelineEtapas({ etapas, entregasPorEtapa, calcularProgressoEtapa }: TimelineEtapasProps) {
  const navigate = useNavigate();

  if (!etapas.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">RoadMap</h2>

      <div className="space-y-3">
        {etapas.map((etapa) => {
          const cfg = statusConfig[etapa.status] || statusConfig.pendente;
          const entregas = entregasPorEtapa[etapa.id] || [];
          const progresso = calcularProgressoEtapa(etapa.id);

          return (
            <Card
              key={etapa.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/meu-sistema/fase/${etapa.id}`)}
            >
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
          );
        })}
      </div>
    </div>
  );
}
