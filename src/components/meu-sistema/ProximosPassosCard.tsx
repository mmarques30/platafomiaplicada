import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListTodo, Circle, ChevronRight } from "lucide-react";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface ProximosPassosCardProps {
  entregas: EntregaBusiness[];
}

const statusMap: Record<string, { label: string; class: string }> = {
  pendente: { label: "Pendente", class: "bg-muted text-muted-foreground" },
  em_andamento: { label: "Em andamento", class: "bg-primary/10 text-primary" },
  concluida: { label: "Concluída", class: "bg-green-100 text-green-700" },
  cancelada: { label: "Cancelada", class: "bg-destructive/10 text-destructive" },
};

const prioridadeMap: Record<string, { label: string; class: string }> = {
  baixa: { label: "Baixa", class: "bg-muted text-muted-foreground" },
  media: { label: "Média", class: "bg-yellow-100 text-yellow-700" },
  alta: { label: "Alta", class: "bg-orange-100 text-orange-700" },
  critica: { label: "Crítica", class: "bg-destructive/10 text-destructive" },
};

function EntregaDetalheDialog({ entrega, open, onClose }: { entrega: EntregaBusiness | null; open: boolean; onClose: () => void }) {
  if (!entrega) return null;
  const status = statusMap[entrega.status] || statusMap.pendente;
  const prioridade = prioridadeMap[entrega.prioridade] || prioridadeMap.baixa;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{entrega.titulo}</DialogTitle>
          {entrega.modulo_relacionado && (
            <DialogDescription>{entrega.modulo_relacionado}</DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-3">
          {entrega.descricao && (
            <p className="text-sm text-muted-foreground">{entrega.descricao}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge className={status.class}>{status.label}</Badge>
            <Badge className={prioridade.class}>{prioridade.label}</Badge>
          </div>
          {entrega.prazo_previsto && (
            <p className="text-xs text-muted-foreground">
              Prazo: {new Date(entrega.prazo_previsto).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProximosPassosCard({ entregas }: ProximosPassosCardProps) {
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaBusiness | null>(null);
  const [showAll, setShowAll] = useState(false);

  const pendentes = entregas.filter(
    (e) => e.status === "pendente" || e.status === "em_andamento"
  );
  const displayed = pendentes.slice(0, 5);
  const hasMore = pendentes.length > 5;

  const EntregaItem = ({ entrega }: { entrega: EntregaBusiness }) => (
    <div
      key={entrega.id}
      className="flex items-start gap-2.5 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 transition-colors"
      onClick={() => setSelectedEntrega(entrega)}
    >
      <Circle
        className={`h-3 w-3 mt-1 shrink-0 ${
          entrega.status === "em_andamento"
            ? "text-primary fill-primary/20"
            : "text-muted-foreground"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{entrega.titulo}</p>
        {entrega.modulo_relacionado && (
          <p className="text-xs text-muted-foreground mt-0.5">{entrega.modulo_relacionado}</p>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
    </div>
  );

  return (
    <>
      <Card className="border-border/50 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-primary">
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {pendentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum passo pendente.</p>
          ) : (
            <>
              {displayed.map((entrega) => (
                <EntregaItem key={entrega.id} entrega={entrega} />
              ))}
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs text-primary"
                  onClick={() => setShowAll(true)}
                >
                  Ver todos ({pendentes.length})
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog detalhe individual */}
      <EntregaDetalheDialog
        entrega={selectedEntrega}
        open={!!selectedEntrega}
        onClose={() => setSelectedEntrega(null)}
      />

      {/* Dialog lista completa */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Todos os Próximos Passos</DialogTitle>
            <DialogDescription>{pendentes.length} itens pendentes</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            {pendentes.map((entrega) => (
              <EntregaItem key={entrega.id} entrega={entrega} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
