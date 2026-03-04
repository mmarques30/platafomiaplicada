import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface EntregasConcluidasCardProps {
  entregas: EntregaBusiness[];
}

export function EntregasConcluidasCard({ entregas }: EntregasConcluidasCardProps) {
  const concluidas = entregas.filter((e) => e.status === "concluida");

  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Entregas Concluídas
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {concluidas.length} de {entregas.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {concluidas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma entrega concluída ainda.</p>
        ) : (
          concluidas.slice(0, 6).map((entrega) => (
            <div key={entrega.id} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
              <p className="text-sm leading-tight">{entrega.titulo}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
