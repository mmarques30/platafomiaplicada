import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Circle } from "lucide-react";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface ProximosPassosCardProps {
  entregas: EntregaBusiness[];
}

export function ProximosPassosCard({ entregas }: ProximosPassosCardProps) {
  const pendentes = entregas
    .filter((e) => e.status === "pendente" || e.status === "em_andamento")
    .slice(0, 6);

  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" />
          Próximos Passos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum passo pendente.</p>
        ) : (
          pendentes.map((entrega) => (
            <div key={entrega.id} className="flex items-start gap-2.5">
              <Circle
                className={`h-3 w-3 mt-1 shrink-0 ${
                  entrega.status === "em_andamento"
                    ? "text-primary fill-primary/20"
                    : "text-muted-foreground"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">{entrega.titulo}</p>
                {entrega.modulo_relacionado && (
                  <p className="text-xs text-muted-foreground mt-0.5">{entrega.modulo_relacionado}</p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
