import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";

interface EtapaHeaderProps {
  etapa: EtapaBusiness;
}

const statusConfig = {
  pendente: {
    label: "Pendente",
    className: "bg-muted text-muted-foreground border-brand-hairline",
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
  const status = statusConfig[etapa.status] || statusConfig.pendente;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold text-foreground">
          Fase {etapa.numero_etapa}: {etapa.titulo}
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
    </div>
  );
}
