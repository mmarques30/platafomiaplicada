import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KanbanCardProps {
  entrega: any;
  isOverlay?: boolean;
}

export default function KanbanCard({ entrega, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: entrega.id,
  });

  const prazoDate = entrega.prazo ? parseISO(entrega.prazo) : null;
  const isAtrasado = prazoDate && isPast(prazoDate) && !["concluido", "aprovada"].includes(entrega.status);
  const responsavel = entrega.responsavel;
  const progresso = entrega.progresso ?? 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg border bg-background p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-30",
        isOverlay && "shadow-lg rotate-2 scale-105"
      )}
    >
      {/* Title */}
      <p className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2">
        {entrega.titulo}
      </p>

      {/* Responsavel */}
      {responsavel && (
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={responsavel.avatar_url} />
            <AvatarFallback className="text-[10px]">
              {responsavel.nome_completo?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {responsavel.nome_completo}
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Progresso</span>
          <span className="text-[10px] font-medium text-foreground">{progresso}%</span>
        </div>
        <Progress value={progresso} className="h-1.5" />
      </div>

      {/* Footer: prazo + ROI */}
      <div className="flex items-center justify-between gap-2">
        {prazoDate && (
          <Badge
            variant={isAtrasado ? "destructive" : "outline"}
            className="text-[10px] px-1.5 py-0 h-5"
          >
            <Clock className="h-3 w-3 mr-1" />
            {format(prazoDate, "dd MMM", { locale: ptBR })}
          </Badge>
        )}

        {entrega.economia_horas_semana != null && entrega.economia_horas_semana > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-primary border-primary/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            {entrega.economia_horas_semana}h/sem
          </Badge>
        )}
      </div>
    </div>
  );
}
