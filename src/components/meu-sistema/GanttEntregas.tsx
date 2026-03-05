import { useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format, differenceInDays, eachMonthOfInterval, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, CheckCircle2, Clock, Circle, XCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface GanttEntregasProps {
  entregas: EntregaBusiness[];
  dataInicio?: string | null;
  dataFim?: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  concluida: { label: "Concluída", color: "#738925", bg: "#738925", icon: <CheckCircle2 className="h-3 w-3" /> },
  em_andamento: { label: "Em andamento", color: "#889C2D", bg: "#889C2D", icon: <Clock className="h-3 w-3" /> },
  pendente: { label: "Pendente", color: "#2F302B", bg: "#2F302B", icon: <Circle className="h-3 w-3" /> },
  cancelada: { label: "Cancelada", color: "#B91C1C", bg: "#B91C1C", icon: <XCircle className="h-3 w-3" /> },
};

const ROW_HEIGHT = 40;
const MONTH_WIDTH = 150;
const SIDEBAR_WIDTH = 240;
const GROUP_HEADER_HEIGHT = 36;

export function GanttEntregas({ entregas, dataInicio, dataFim }: GanttEntregasProps) {
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaBusiness | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sync vertical scroll between sidebar and timeline
  const handleSidebarScroll = useCallback(() => {
    if (sidebarRef.current && timelineRef.current) {
      timelineRef.current.scrollTop = sidebarRef.current.scrollTop;
    }
  }, []);

  const handleTimelineScroll = useCallback(() => {
    if (timelineRef.current && sidebarRef.current) {
      sidebarRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  }, []);

  const { rangeStart, rangeEnd, months, totalDays } = useMemo(() => {
    const now = new Date();
    let start = dataInicio ? parseISO(dataInicio) : now;
    let end = dataFim ? parseISO(dataFim) : now;

    entregas.forEach((e) => {
      const created = parseISO(e.created_at);
      if (created < start) start = created;
      if (e.prazo_previsto) {
        const prazo = parseISO(e.prazo_previsto);
        if (prazo > end) end = prazo;
      }
    });

    const rangeStart = startOfMonth(start);
    const rangeEnd = endOfMonth(end);
    const totalDays = Math.max(differenceInDays(rangeEnd, rangeStart), 1);
    const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

    return { rangeStart, rangeEnd, months, totalDays };
  }, [entregas, dataInicio, dataFim]);

  const chartWidth = months.length * MONTH_WIDTH;

  // Group entregas by modulo
  const grouped = useMemo(() => {
    const active = entregas.filter((e) => e.tipo === "ativa");
    const order: Record<string, number> = { em_andamento: 0, pendente: 1, concluida: 2, cancelada: 3 };
    const sorted = [...active].sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));

    const groups: Record<string, EntregaBusiness[]> = {};
    sorted.forEach((e) => {
      const key = e.modulo_relacionado || "Geral";
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [entregas]);

  const groupKeys = Object.keys(grouped);

  // Initialize open groups
  useMemo(() => {
    const init: Record<string, boolean> = {};
    groupKeys.forEach((k) => (init[k] = true));
    if (Object.keys(openGroups).length === 0 && groupKeys.length > 0) {
      setOpenGroups(init);
    }
  }, [groupKeys]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getBarPosition = (entrega: EntregaBusiness) => {
    const created = parseISO(entrega.created_at);
    const prazo = entrega.prazo_previsto
      ? parseISO(entrega.prazo_previsto)
      : new Date(created.getTime() + 14 * 86400000);

    const startOffset = Math.max(differenceInDays(created, rangeStart), 0);
    const duration = Math.max(differenceInDays(prazo, created), 3);

    const left = (startOffset / totalDays) * chartWidth;
    const width = Math.max((duration / totalDays) * chartWidth, 24);

    return { left, width: Math.min(width, chartWidth - left) };
  };

  const todayOffset = useMemo(() => {
    const days = differenceInDays(new Date(), rangeStart);
    if (days >= 0 && days <= totalDays) {
      return (days / totalDays) * chartWidth;
    }
    return null;
  }, [rangeStart, totalDays, chartWidth]);

  const totalEntregas = Object.values(grouped).flat().length;

  if (totalEntregas === 0) {
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

  // Build flat list of visible rows for timeline rendering
  const visibleRows: { type: "group"; key: string }[] | { type: "item"; entrega: EntregaBusiness }[] = [];
  const flatRows: Array<{ type: "group"; key: string } | { type: "item"; entrega: EntregaBusiness }> = [];

  groupKeys.forEach((key) => {
    flatRows.push({ type: "group", key });
    if (openGroups[key] !== false) {
      grouped[key].forEach((e) => flatRows.push({ type: "item", entrega: e }));
    }
  });

  return (
    <>
      <Card className="overflow-hidden" style={{ borderColor: "#C5CC8A" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">
              Cronograma de Entregas
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex border-t border-border" style={{ height: "420px" }}>
            {/* Sidebar */}
            <div
              className="flex-shrink-0 border-r border-border flex flex-col"
              style={{ width: `${SIDEBAR_WIDTH}px` }}
            >
              {/* Sidebar header */}
              <div
                className="px-4 flex items-center text-xs font-semibold border-b"
                style={{ height: `${ROW_HEIGHT}px`, minHeight: `${ROW_HEIGHT}px`, background: "#F6F7E9", color: "#2F302B", borderColor: "#C5CC8A" }}
              >
                Entregas
              </div>

              {/* Sidebar body */}
              <div
                ref={sidebarRef}
                className="flex-1 overflow-y-auto overflow-x-hidden"
                onScroll={handleSidebarScroll}
                style={{ scrollbarWidth: "none" }}
              >
                {groupKeys.map((key) => (
                  <div key={key}>
                    {/* Group header */}
                    <div
                      className="flex items-center gap-1.5 px-3 text-xs font-semibold cursor-pointer transition-colors select-none"
                      style={{ height: `${GROUP_HEADER_HEIGHT}px`, background: "#E9EBC6", color: "#738925", borderBottom: "1px solid #C5CC8A" }}
                      onClick={() => toggleGroup(key)}
                    >
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          openGroups[key] !== false ? "rotate-90" : ""
                        }`}
                        style={{ color: "#889C2D" }}
                      />
                      <span className="truncate">{key}</span>
                      <span className="ml-auto text-[10px] font-normal opacity-60">
                        {grouped[key].length}
                      </span>
                    </div>

                    {/* Items */}
                    {openGroups[key] !== false &&
                      grouped[key].map((entrega) => {
                        const cfg = STATUS_CONFIG[entrega.status] || STATUS_CONFIG.pendente;
                        return (
                          <div
                            key={entrega.id}
                            className="flex items-center gap-1.5 px-4 transition-colors cursor-pointer group"
                            style={{ height: `${ROW_HEIGHT}px`, borderBottom: "1px solid #E9EBC6" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#F6F7E9"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            onClick={() => setSelectedEntrega(entrega)}
                          >
                            <span style={{ color: cfg.color }}>{cfg.icon}</span>
                            <span className="text-xs truncate flex-1 group-hover:text-foreground text-foreground">
                              {entrega.titulo}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Month headers - fixed */}
              <div
                className="flex overflow-hidden flex-shrink-0"
                style={{ height: `${ROW_HEIGHT}px`, minHeight: `${ROW_HEIGHT}px`, background: "#F6F7E9", borderBottom: "1px solid #C5CC8A" }}
              >
                <div
                  className="flex"
                  style={{
                    minWidth: `${chartWidth}px`,
                    transform: `translateX(-${timelineRef.current?.scrollLeft || 0}px)`,
                  }}
                  id="gantt-month-headers"
                >
                  {months.map((month, i) => (
                    <div
                      key={i}
                      className="text-xs font-medium flex items-center justify-center capitalize"
                      style={{ width: `${MONTH_WIDTH}px`, minWidth: `${MONTH_WIDTH}px`, color: "#2F302B", borderRight: "1px solid #C5CC8A" }}
                    >
                      {format(month, "MMM yyyy", { locale: ptBR })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline body */}
              <div
                ref={timelineRef}
                className="flex-1 overflow-auto relative"
                onScroll={(e) => {
                  handleTimelineScroll();
                  // Sync month headers scroll
                  const headers = document.getElementById("gantt-month-headers");
                  if (headers) {
                    headers.style.transform = `translateX(-${(e.target as HTMLDivElement).scrollLeft}px)`;
                  }
                }}
              >
                <div style={{ minWidth: `${chartWidth}px`, position: "relative" }}>
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none" style={{ minWidth: `${chartWidth}px` }}>
                    {months.map((_, i) => (
                      <div
                        key={i}
                        style={{ width: `${MONTH_WIDTH}px`, minWidth: `${MONTH_WIDTH}px`, borderRight: "1px solid #E9EBC640" }}
                      />
                    ))}
                  </div>

                  {/* Today marker */}
                  {todayOffset !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-px z-20 pointer-events-none"
                      style={{
                        left: `${todayOffset}px`,
                        background: "#738925",
                      }}
                    >
                      <div
                        className="absolute -top-0 -translate-x-1/2 text-[9px] font-medium px-1.5 py-0.5 rounded-b"
                        style={{
                          background: "#738925",
                          color: "#FFFFFF",
                        }}
                      >
                        Hoje
                      </div>
                    </div>
                  )}

                  {/* Rows */}
                  {groupKeys.map((key) => (
                    <div key={key}>
                      {/* Group spacer row */}
                      <div
                        style={{ height: `${GROUP_HEADER_HEIGHT}px`, background: "#E9EBC6", borderBottom: "1px solid #C5CC8A" }}
                      />

                      {/* Item rows with bars */}
                      {openGroups[key] !== false &&
                        grouped[key].map((entrega, idx) => {
                          const { left, width } = getBarPosition(entrega);
                          const cfg = STATUS_CONFIG[entrega.status] || STATUS_CONFIG.pendente;

                          return (
                            <div
                              key={entrega.id}
                              className="relative transition-colors cursor-pointer"
                              style={{ height: `${ROW_HEIGHT}px`, borderBottom: "1px solid #E9EBC6" }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#F6F7E9"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              onClick={() => setSelectedEntrega(entrega)}
                            >
                              <motion.div
                                initial={{ opacity: 0, scaleX: 0.3 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ duration: 0.4, delay: idx * 0.05, ease: "easeOut" }}
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  left: `${left}px`,
                                  width: `${width}px`,
                                  transformOrigin: "left center",
                                }}
                              >
                                <div
                                  className="h-7 rounded-md flex items-center px-2 text-[11px] font-medium truncate shadow-sm hover:shadow-md transition-shadow"
                                  style={{
                                    backgroundColor: cfg.bg,
                                    color: "#FFFFFF",
                                  }}
                                  title={`${entrega.titulo} — ${cfg.label}`}
                                >
                                  <span className="truncate">{entrega.titulo}</span>
                                </div>
                              </motion.div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
                <span className="font-medium" style={{ color: STATUS_CONFIG[selectedEntrega.status]?.color }}>
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
