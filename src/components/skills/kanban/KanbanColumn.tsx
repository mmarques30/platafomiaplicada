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
        "flex flex-col rounded-xl border bg-card min-h-[300px] transition-colors",
        isOver && "ring-2 ring-primary/40 bg-primary/5"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl border-b"
        style={column.headerBg ? { backgroundColor: column.headerBg } : undefined}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
          {column.title}
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground font-semibold bg-background/60 rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1 p-2">
        {children}
        {items.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60 italic py-8">
            Nenhuma entrega
          </div>
        )}
      </div>
    </div>
  );
}
