import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle
} from "lucide-react";
import { FaseProcesso } from "@/hooks/useFasesProcesso";
import { cn } from "@/lib/utils";

interface FaseCardProps {
  fase: FaseProcesso;
  onEdit: (fase: FaseProcesso) => void;
}

export const FaseCard = ({ fase, onEdit }: FaseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (fase.status) {
      case "concluida":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "em_andamento":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "bloqueada":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      concluida: "default",
      em_andamento: "secondary",
      bloqueada: "destructive",
      pendente: "outline",
    };

    const labels: Record<string, string> = {
      concluida: "Concluída",
      em_andamento: "Em Andamento",
      bloqueada: "Bloqueada",
      pendente: "Pendente",
    };

    return (
      <Badge variant={variants[fase.status]}>
        {labels[fase.status]}
      </Badge>
    );
  };

  const hasDetails = fase.projeto || fase.sessao || (fase.tarefas && fase.tarefas.length > 0);

  return (
    <Card className={cn(
      "relative",
      fase.status === "concluida" && "border-green-200 bg-green-50/50",
      fase.status === "em_andamento" && "border-yellow-200 bg-yellow-50/50"
    )}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Ícone de Status */}
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon()}
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-muted-foreground">
                  {fase.fase_numero}
                </span>
                <div>
                  <CardTitle className="text-lg">
                    {fase.nome_fase}
                    {fase.projeto && fase.fase_numero >= 3 && fase.fase_numero <= 8 && (
                      <span className="text-muted-foreground ml-2">- {fase.projeto.titulo}</span>
                    )}
                  </CardTitle>
                  {fase.descricao && (
                    <CardDescription className="mt-1">{fase.descricao}</CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(fase)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Barra de Progresso */}
            {fase.status !== "pendente" && fase.status !== "bloqueada" && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{fase.progresso_tarefas}%</span>
                </div>
                <Progress value={fase.progresso_tarefas} className="h-2" />
              </div>
            )}

            {/* Datas */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              {fase.data_inicio && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Início: {format(new Date(fase.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
              {fase.data_conclusao && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Conclusão: {format(new Date(fase.data_conclusao), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Detalhes Expansíveis */}
      {hasDetails && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardContent className="pt-0">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Ocultar Detalhes
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 mt-4">
              {/* Sessão Associada */}
              {fase.sessao && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Sessão Associada
                  </div>
                  <div className="pl-6 text-sm space-y-1">
                    <p><strong>Título:</strong> {fase.sessao.titulo}</p>
                    <p><strong>Data:</strong> {format(new Date(fase.sessao.data_sessao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    {fase.sessao.duracao && <p><strong>Duração:</strong> {fase.sessao.duracao} min</p>}
                    <Badge variant={fase.sessao.status === "realizada" ? "default" : "secondary"}>
                      {fase.sessao.status === "realizada" ? "Realizada" : "Agendada"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Projeto Associado */}
              {fase.projeto && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FolderKanban className="h-4 w-4" />
                    Projeto Associado
                  </div>
                  <div className="pl-6 text-sm space-y-1">
                    <p><strong>Título:</strong> {fase.projeto.titulo}</p>
                    <p><strong>Objetivo:</strong> {fase.projeto.objetivo_projeto}</p>
                    <div className="flex gap-2 items-center">
                      <strong>Status:</strong>
                      <Badge variant={
                        fase.projeto.status === "concluido" ? "default" :
                        fase.projeto.status === "em_andamento" ? "secondary" : "outline"
                      }>
                        {fase.projeto.status === "concluido" ? "Concluído" :
                         fase.projeto.status === "em_andamento" ? "Em Andamento" : "Planejamento"}
                      </Badge>
                    </div>
                    {fase.projeto.data_entrega && (
                      <p><strong>Data Entrega:</strong> {format(new Date(fase.projeto.data_entrega), "dd/MM/yyyy", { locale: ptBR })}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tarefas */}
              {fase.tarefas && fase.tarefas.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ListTodo className="h-4 w-4" />
                    Tarefas ({fase.tarefas.filter((t: any) => t.status === "concluida").length}/{fase.tarefas.length})
                  </div>
                  <div className="pl-6 space-y-2">
                    {fase.tarefas.map((tarefa: any) => (
                      <div key={tarefa.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 
                          className={cn(
                            "h-4 w-4",
                            tarefa.status === "concluida" ? "text-green-500" : "text-muted-foreground"
                          )} 
                        />
                        <span className={tarefa.status === "concluida" ? "line-through text-muted-foreground" : ""}>
                          {tarefa.titulo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              {fase.observacoes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4" />
                    Observações do Mentor
                  </div>
                  <p className="pl-6 text-sm text-muted-foreground">{fase.observacoes}</p>
                </div>
              )}
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
      )}

      {/* Linha de Conexão */}
      {fase.fase_numero < 9 && (
        <div className="absolute left-[29px] top-full w-0.5 h-4 bg-border" />
      )}
    </Card>
  );
};
