import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BacklogItem } from "@/hooks/useSkillsBacklog";

const prioridadeCores: Record<string, string> = {
  p1: "bg-red-500/15 text-red-700 border-red-200",
  p2: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
  p3: "bg-[#9EB038]/10 text-[#9EB038] border-[#9EB038]/20",
  alta: "bg-red-500/15 text-red-700 border-red-200",
  media: "bg-[#9EB038]/15 text-[#738925] border-[#9EB038]/30",
  baixa: "bg-[#9EB038]/10 text-[#9EB038] border-[#9EB038]/20",
};

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

      <div className="flex flex-wrap gap-1.5">
        {item.status === "aprovado" && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/15 text-blue-700 border-blue-200">
            APROVADO
          </Badge>
        )}
        {item.status === "priorizado" && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-500/15 text-indigo-700 border-indigo-200">
            PRIORIZADO
          </Badge>
        )}
        {item.prioridade && (
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", prioridadeCores[item.prioridade])}>
            {item.prioridade.toUpperCase()}
          </Badge>
        )}
        {item.area_impactada && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {item.area_impactada}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {Array.isArray(item.trilhas_recomendadas) && item.trilhas_recomendadas.length > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <BookOpen className="h-3 w-3" />
              {item.trilhas_recomendadas.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          
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
    </div>
  );
}
