import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format, differenceInDays, eachMonthOfInterval, startOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, CheckCircle2, Clock, Circle, XCircle } from "lucide-react";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface GanttEntregasProps {
  entregas: EntregaBusiness[];
  dataInicio?: string | null;
  dataFim?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; colorClass: string; bgClass: string; icon: React.ReactNode }> = {
  concluida: { label: "Concluída", colorClass: "text-green-600", bgClass: "bg-green-500", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  em_andamento: { label: "Em andamento", colorClass: "text-primary", bgClass: "bg-primary", icon: <Clock className="h-3.5 w-3.5" /> },
  pendente: { label: "Pendente", colorClass: "text-muted-foreground", bgClass: "bg-muted-foreground/60", icon: <Circle className="h-3.5 w-3.5" /> },
  cancelada: { label: "Cancelada", colorClass: "text-destructive", bgClass: "bg-destructive/60", icon: <XCircle className="h-3.5 w-3.5" /> },
};

export function GanttEntregas({ entregas, dataInicio, dataFim }: GanttEntregasProps) {
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaBusiness | null>(null);

  const { rangeStart, rangeEnd, months, totalDays } = useMemo(() => {
    const now = new Date();
    let start = dataInicio ? parseISO(dataInicio) : now;
    let end = dataFim ? parseISO(dataFim) : now;

    // Expand range to include all entregas
    entregas.forEach((e) => {
      const created = parseISO(e.created_at);
      if (created < start) start = created;
      if (e.prazo_previsto) {
        const prazo = parseISO(e.prazo_previsto);
        if (prazo > end) end = prazo;
      }
    });

    // Add padding
    const rangeStart = startOfMonth(start);
    const rangeEnd = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    const totalDays = Math.max(differenceInDays(rangeEnd, rangeStart), 1);
    const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

    return { rangeStart, rangeEnd, months, totalDays };
  }, [entregas, dataInicio, dataFim]);

  const COL_WIDTH = 120; // px per month
  const chartWidth = Math.max(months.length * COL_WIDTH, 600);
  const ROW_HEIGHT = 36;

  const getBarStyle = (entrega: EntregaBusiness) => {
    const created = parseISO(entrega.created_at);
    const prazo = entrega.prazo_previsto ? parseISO(entrega.prazo_previsto) : new Date(created.getTime() + 14 * 86400000); // default 14 days

    const startOffset = Math.max(differenceInDays(created, rangeStart), 0);
    const duration = Math.max(differenceInDays(prazo, created), 3); // min 3 days width

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  // Sort: em_andamento first, then pendente, then concluida
  const sortedEntregas = useMemo(() => {
    const order: Record<string, number> = { em_andamento: 0, pendente: 1, concluida: 2, cancelada: 3 };
    return [...entregas]
      .filter((e) => e.tipo === "ativa")
      .sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));
  }, [entregas]);

  if (sortedEntregas.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Cronograma de Entregas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma entrega ativa para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Cronograma de Entregas
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className={`inline-block h-2.5 w-2.5 rounded-sm ${cfg.bgClass}`} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div style={{ minWidth: `${chartWidth}px` }}>
              {/* Month headers */}
              <div className="flex border-b border-border sticky top-0 bg-card z-10">
                <div className="w-[200px] min-w-[200px] px-4 py-2 text-xs font-medium text-muted-foreground border-r border-border">
                  Entrega
                </div>
                <div className="flex-1 flex relative">
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="text-xs text-muted-foreground py-2 text-center border-r border-border/50 capitalize"
                      style={{ width: `${100 / months.length}%` }}
                    >
                      {format(month, "MMM yyyy", { locale: ptBR })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {sortedEntregas.map((entrega) => {
                const barStyle = getBarStyle(entrega);
                const cfg = STATUS_CONFIG[entrega.status] || STATUS_CONFIG.pendente;

                return (
                  <div
                    key={entrega.id}
                    className="flex items-center border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                    style={{ height: `${ROW_HEIGHT}px` }}
                    onClick={() => setSelectedEntrega(entrega)}
                  >
                    <div className="w-[200px] min-w-[200px] px-4 text-xs truncate border-r border-border/50 flex items-center gap-1.5">
                      <span className={cfg.colorClass}>{cfg.icon}</span>
                      <span className="truncate">{entrega.titulo}</span>
                    </div>
                    <div className="flex-1 relative px-1" style={{ height: "100%" }}>
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex">
                        {months.map((_, i) => (
                          <div key={i} className="border-r border-border/20" style={{ width: `${100 / months.length}%` }} />
                        ))}
                      </div>
                      {/* Today marker */}
                      {(() => {
                        const todayOffset = differenceInDays(new Date(), rangeStart);
                        if (todayOffset >= 0 && todayOffset <= totalDays) {
                          return (
                            <div
                              className="absolute top-0 bottom-0 w-px bg-destructive/40 z-10"
                              style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                            />
                          );
                        }
                        return null;
                      })()}
                      {/* Bar */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-sm ${cfg.bgClass} opacity-90 hover:opacity-100 transition-opacity`}
                        style={{ ...barStyle, minWidth: "6px" }}
                        title={`${entrega.titulo} — ${cfg.label}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntrega} onOpenChange={() => setSelectedEntrega(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedEntrega?.titulo}</DialogTitle>
            <DialogDescription>Detalhes da entrega</DialogDescription>
          </DialogHeader>
          {selectedEntrega && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${STATUS_CONFIG[selectedEntrega.status]?.colorClass}`}>
                  {STATUS_CONFIG[selectedEntrega.status]?.label}
                </span>
              </div>
              {selectedEntrega.descricao && (
                <div>
                  <span className="text-muted-foreground">Descrição:</span>
                  <p className="mt-1">{selectedEntrega.descricao}</p>
                </div>
              )}
              {selectedEntrega.prazo_previsto && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Prazo:</span>
                  <span>{format(parseISO(selectedEntrega.prazo_previsto), "dd/MM/yyyy")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Prioridade:</span>
                <span className="capitalize">{selectedEntrega.prioridade}</span>
              </div>
              {selectedEntrega.modulo_relacionado && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Módulo:</span>
                  <span>{selectedEntrega.modulo_relacionado}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
