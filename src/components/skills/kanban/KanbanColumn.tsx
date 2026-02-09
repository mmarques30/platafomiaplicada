import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { KanbanColumnDef } from "../ProjetoSkillsKanban";

interface KanbanColumnProps {
  column: KanbanColumnDef;
  items: any[];
  children: ReactNode;
}

export default function KanbanColumn({ column, items, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border bg-card p-3 min-h-[300px] transition-colors",
        isOver && "ring-2 ring-primary/40 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-sm font-semibold text-foreground truncate">{column.title}</h3>
        <span className="ml-auto text-xs text-muted-foreground font-medium bg-muted rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {children}
        {items.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60 italic">
            Nenhuma entrega
          </div>
        )}
      </div>
    </div>
  );
}
