import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, BookOpen, Clock, Layers, TrendingUp } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  pendente: "Backlog",
  em_andamento: "Em Andamento",
  aguardando_validacao: "Em Validação",
  concluido: "Rodando",
  aprovada: "Rodando",
};

const PRIORIDADE_COLORS: Record<string, string> = {
  P1: "bg-destructive text-destructive-foreground",
  P2: "bg-[hsl(45,90%,50%)] text-foreground",
  P3: "bg-muted text-muted-foreground",
};

const TIPO_LABELS: Record<string, string> = {
  individual: "Individual",
  colaborativo: "Colaborativo",
  sistema: "Sistema",
};

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
  const tipo = entrega.tipo ?? "individual";
  const prioridade = entrega.prioridade ?? "P3";
  const processos = entrega.processos_resolvidos ?? 0;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg border border-dashed border-border bg-background p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all space-y-2",
        isDragging && "opacity-30",
        isOverlay && "shadow-lg rotate-2 scale-105"
      )}
    >
      {/* Title + Badges */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1">
          {entrega.titulo}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
            {TIPO_LABELS[tipo] ?? tipo}
          </Badge>
          <Badge className={cn("text-[9px] px-1.5 py-0 h-4 border-0", PRIORIDADE_COLORS[prioridade])}>
            {prioridade}
          </Badge>
        </div>
      </div>

      {/* Alerta atraso */}
      {isAtrasado && prazoDate && (
        <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1">
          <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
          <span className="text-[10px] text-destructive font-medium">
            Atrasado: Prazo era {format(prazoDate, "dd/MM", { locale: ptBR })}
          </span>
        </div>
      )}

      {/* Responsavel */}
      {responsavel && (
        <div className="flex items-center gap-2">
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

      {/* Processos resolvidos + Conteúdo suporte */}
      <div className="flex items-center gap-3">
        {processos > 0 && (
          <div className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Resolve: {processos} processo{processos > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {Array.isArray(entrega.conteudo_suporte) && entrega.conteudo_suporte.length > 0 && (
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-primary" />
            <span className="text-[10px] text-primary font-medium">
              {entrega.conteudo_suporte.length} trilha{entrega.conteudo_suporte.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Progresso</span>
          <span className="text-[10px] font-medium text-foreground">{progresso}%</span>
        </div>
        <Progress value={progresso} className="h-1.5" />
      </div>

      {/* Footer: prazo + ROI */}
      <div className="flex items-center justify-between gap-2">
        {prazoDate && !isAtrasado && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
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

      {/* Status badge */}
      <div>
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
          {STATUS_LABELS[entrega.status] ?? entrega.status}
        </Badge>
      </div>
    </div>
  );
}
