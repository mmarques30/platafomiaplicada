import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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

      <div className="flex items-center justify-between pt-1">
        {item.area_impactada ? (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {item.area_impactada}
          </Badge>
        ) : <span />}

        <div className="flex -space-x-1.5">
          {item.responsavel && (
            <Avatar className="h-5 w-5 border-2 border-background">
              <AvatarImage src={item.responsavel.avatar_url || ""} />
              <AvatarFallback className="text-[8px]">
                {item.responsavel.nome?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          {item.colaborador && (
            <Avatar className="h-5 w-5 border-2 border-background">
              <AvatarImage src={item.colaborador.avatar_url || ""} />
              <AvatarFallback className="text-[8px]">
                {item.colaborador.nome?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}
