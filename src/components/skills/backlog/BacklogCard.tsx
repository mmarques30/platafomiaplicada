import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

interface BacklogCardProps {
  item: BacklogItem;
  onClick: () => void;
}

export default function BacklogCard({ item, onClick }: BacklogCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-background p-3 cursor-pointer hover:shadow-md transition-shadow space-y-2",
        isDragging && "opacity-60 shadow-lg"
      )}
    >
      <h4 className="text-sm font-semibold leading-tight line-clamp-2">{item.titulo}</h4>

      {item.descricao && (
        <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
      )}

      <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
        <span className="truncate">{item.responsavel?.nome || ""}</span>
        {item.created_at && (
          <span className="shrink-0 ml-2">{format(new Date(item.created_at), "dd/MM/yy")}</span>
        )}
      </div>
    </div>
  );
}
