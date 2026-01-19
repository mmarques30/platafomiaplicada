import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";

interface EtapaHeaderProps {
  etapa: EtapaBusiness;
}

const statusConfig = {
  pendente: {
    label: "Pendente",
    className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
  },
  em_andamento: {
    label: "Em Andamento",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  concluida: {
    label: "Concluída",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  },
};

export function EtapaHeader({ etapa }: EtapaHeaderProps) {
  const navigate = useNavigate();
  const status = statusConfig[etapa.status] || statusConfig.pendente;

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-foreground">
            Encontro {etapa.numero_etapa}: {etapa.titulo}
          </h1>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        {etapa.data_prevista && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Data prevista: {format(new Date(etapa.data_prevista), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {etapa.objetivo && (
          <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-lg border">
            <Target className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Objetivo
              </span>
              <p className="text-foreground mt-1">{etapa.objetivo}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
