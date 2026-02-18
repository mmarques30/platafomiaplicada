import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import BacklogCard from "./BacklogCard";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";
import { ReactNode } from "react";
import { XCircle } from "lucide-react";

const columns = [
  { id: "levantado", title: "LEVANTADO", headerBg: "hsl(var(--muted))", statuses: ["levantado", "backlog"] },
  { id: "priorizado", title: "PRIORIZADO", headerBg: "rgba(99, 102, 241, 0.12)", statuses: ["aprovado", "priorizado"] },
  { id: "em_execucao", title: "EM EXECUÇÃO", headerBg: "rgba(158, 176, 56, 0.12)", statuses: ["em_execucao"] },
  { id: "entregue", title: "ENTREGUE", headerBg: "rgba(115, 137, 37, 0.15)", statuses: ["entregue"] },
];

function Column({ id, title, headerBg, children, count }: { id: string; title: string; headerBg: string; children: ReactNode; count: number }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn("flex flex-col rounded-xl border bg-card min-h-[300px] transition-colors", isOver && "ring-2 ring-primary/40 bg-primary/5")}>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl border-b" style={{ backgroundColor: headerBg }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">{title}</h3>
        <span className="ml-auto text-[10px] text-muted-foreground font-semibold bg-background/60 rounded-full px-2 py-0.5">{count}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 p-2">
        {children}
        {count === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60 italic py-8">Nenhum projeto</div>
        )}
      </div>
    </div>
  );
}

interface BacklogKanbanProps {
  items: BacklogItem[];
  onStatusChange: (id: string, status: string) => void;
  onItemClick: (item: BacklogItem) => void;
}

export default function BacklogKanban({ items, onStatusChange, onItemClick }: BacklogKanbanProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const colId = over.id as string;
      if (columns.some(c => c.id === colId)) {
        onStatusChange(active.id as string, colId);
      }
    }
  };

  const naoAprovados = items.filter(i => i.status === "nao_aprovado");
  const grouped = columns.map(col => ({
    ...col,
    items: items.filter(i => col.statuses.includes(i.status || "levantado")),
  }));

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {grouped.map(col => (
            <Column key={col.id} id={col.id} title={col.title} headerBg={col.headerBg} count={col.items.length}>
              {col.items.map(item => (
                <BacklogCard key={item.id} item={item} onClick={() => onItemClick(item)} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>

      {naoAprovados.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl border-b bg-destructive/10">
            <XCircle className="h-3.5 w-3.5 text-destructive" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-destructive">Não Aprovados</h3>
            <span className="ml-auto text-[10px] text-muted-foreground font-semibold bg-background/60 rounded-full px-2 py-0.5">{naoAprovados.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2">
            {naoAprovados.map(item => (
              <BacklogCard key={item.id} item={item} onClick={() => onItemClick(item)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
