import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useNavigate } from "react-router-dom";
import { differenceInDays, parseISO, isPast } from "date-fns";

export function BusinessTarefasCard() {
  const { tarefas, isLoading } = useMentoriaTarefas();
  const navigate = useNavigate();

  const tarefasPendentes = tarefas?.filter(t => 
    t.status === "pendente" || t.status === "em_andamento"
  ) || [];
  
  const tarefasAtrasadas = tarefasPendentes.filter(t => 
    t.prazo_entrega && isPast(parseISO(t.prazo_entrega))
  );
  
  const tarefasExibir = tarefasPendentes.slice(0, 4);

  const getDiasRestantes = (prazoEntrega: string | null) => {
    if (!prazoEntrega) return null;
    const dias = differenceInDays(parseISO(prazoEntrega), new Date());
    return dias;
  };

  const getPrazoBadge = (prazo: string | null) => {
    const dias = getDiasRestantes(prazo);
    if (dias === null) return null;
    
    if (dias < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Atrasada
        </Badge>
      );
    }
    
    if (dias === 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Hoje
        </Badge>
      );
    }
    
    if (dias <= 3) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
          <Clock className="h-3 w-3 mr-1" />
          {dias}d
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        {dias}d
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Tarefas Pendentes
          </CardTitle>
          <div className="flex items-center gap-2">
            {tarefasAtrasadas.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {tarefasAtrasadas.length} atrasada{tarefasAtrasadas.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {tarefasPendentes.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tarefasExibir.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma tarefa pendente</p>
          </div>
        ) : (
          <>
            {tarefasExibir.map((tarefa) => (
              <div
                key={tarefa.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tarefa.titulo}</p>
                  {tarefa.descricao && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {tarefa.descricao}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex-shrink-0">
                  {getPrazoBadge(tarefa.prazo_entrega)}
                </div>
              </div>
            ))}
            
            <Button
              variant="ghost"
              className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => navigate("/mentoria/tarefas")}
            >
              Ver Todas as Tarefas
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
