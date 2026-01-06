import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  FolderKanban,
  ListTodo,
  MessageSquare,
  Edit,
  AlertCircle,
  MapPin
} from "lucide-react";
import { FaseProcesso } from "@/hooks/useFasesProcesso";
import { cn } from "@/lib/utils";

interface FaseCardProps {
  fase: FaseProcesso;
  onEdit?: (fase: FaseProcesso) => void;
  readonly?: boolean;
}

export const FaseCard = ({ fase, onEdit, readonly = false }: FaseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (fase.status) {
      case "concluida":
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          badge: "default" as const,
          label: "Concluída"
        };
      case "em_andamento":
        return {
          icon: <MapPin className="h-5 w-5" />,
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/30",
          badge: "secondary" as const,
          label: "Em Andamento"
        };
      case "bloqueada":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          badge: "destructive" as const,
          label: "Bloqueada"
        };
      default:
        return {
          icon: <Circle className="h-5 w-5" />,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-muted",
          badge: "outline" as const,
          label: "Pendente"
        };
    }
  };

  const status = getStatusConfig();
  const hasDetails = fase.projeto || fase.sessao || (fase.tarefas && fase.tarefas.length > 0) || fase.observacoes;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      status.borderColor
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Header compacto */}
        <div className="flex items-center gap-3 p-4">
          {/* Ícone de status */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            status.bgColor,
            status.color
          )}>
            {status.icon}
          </div>

          {/* Número + Nome */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-muted-foreground">
                {fase.fase_numero}.
              </span>
              <span className="font-semibold truncate">{fase.nome_fase}</span>
            </div>
            {fase.descricao && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {fase.descricao}
              </p>
            )}
          </div>

          {/* Badge + Progresso + Ações */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Barra de progresso mini */}
            {fase.status !== "pendente" && fase.status !== "bloqueada" && (
              <div className="hidden sm:flex items-center gap-2 w-24">
                <Progress value={fase.progresso_tarefas} className="h-1.5" />
                <span className="text-xs text-muted-foreground w-8">
                  {fase.progresso_tarefas}%
                </span>
              </div>
            )}

            <Badge variant={status.badge} className="hidden sm:inline-flex">
              {status.label}
            </Badge>

            {/* Botão de edição */}
            {!readonly && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(fase);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {/* Botão expandir */}
            {hasDetails && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>

        {/* Conteúdo expandido */}
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-4">
            {/* Datas */}
            {(fase.data_inicio || fase.data_conclusao) && (
              <div className="flex gap-4 text-sm text-muted-foreground border-t pt-3">
                {fase.data_inicio && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Início: {format(new Date(fase.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
                {fase.data_conclusao && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Conclusão: {format(new Date(fase.data_conclusao), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
            )}

            {/* Sessão Associada */}
            {fase.sessao && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  Sessão: {fase.sessao.titulo}
                </div>
                <div className="text-xs text-muted-foreground pl-6">
                  {format(new Date(fase.sessao.data_sessao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  {fase.sessao.duracao && ` • ${fase.sessao.duracao} min`}
                  <Badge variant={fase.sessao.status === "realizada" ? "default" : "secondary"} className="ml-2">
                    {fase.sessao.status === "realizada" ? "Realizada" : "Agendada"}
                  </Badge>
                </div>
                {fase.sessao.feedback_entregas && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs">
                    <strong className="text-blue-700 dark:text-blue-300">Feedback:</strong>
                    <p className="text-blue-600 dark:text-blue-200 mt-1">{fase.sessao.feedback_entregas}</p>
                  </div>
                )}
              </div>
            )}

            {/* Projeto Associado */}
            {fase.projeto && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  Projeto: {fase.projeto.titulo}
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {fase.projeto.objetivo_projeto}
                </p>
              </div>
            )}

            {/* Tarefas */}
            {fase.tarefas && fase.tarefas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ListTodo className="h-4 w-4 text-primary" />
                  Tarefas ({fase.tarefas.filter((t: any) => t.status === "concluida").length}/{fase.tarefas.length})
                </div>
                <div className="pl-6 space-y-1">
                  {fase.tarefas.slice(0, 5).map((tarefa: any) => (
                    <div key={tarefa.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 
                        className={cn(
                          "h-3.5 w-3.5",
                          tarefa.status === "concluida" ? "text-green-500" : "text-muted-foreground"
                        )} 
                      />
                      <span className={tarefa.status === "concluida" ? "line-through text-muted-foreground" : ""}>
                        {tarefa.titulo}
                      </span>
                    </div>
                  ))}
                  {fase.tarefas.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      + {fase.tarefas.length - 5} tarefas...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            {fase.observacoes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                  <MessageSquare className="h-4 w-4" />
                  Observações do Mentor
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-200 mt-1 pl-6">
                  {fase.observacoes}
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
