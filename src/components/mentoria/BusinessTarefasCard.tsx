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

  const getDiasRestantes = (prazoEntrega: string | null) => {
    if (!prazoEntrega) return null;
    const dias = differenceInDays(parseISO(prazoEntrega), new Date());
    return dias;
  };

  // Ordenar por urgência: vencidas primeiro, depois por prazo mais próximo
  const tarefasOrdenadas = [...tarefasPendentes].sort((a, b) => {
    const diasA = getDiasRestantes(a.prazo_entrega);
    const diasB = getDiasRestantes(b.prazo_entrega);
    
    // Sem prazo vai pro final
    if (diasA === null && diasB === null) return 0;
    if (diasA === null) return 1;
    if (diasB === null) return -1;
    
    // Ordenar por dias (vencidas primeiro = dias negativos)
    return diasA - diasB;
  });

  // Pegar apenas 3 mais urgentes
  const tarefasExibir = tarefasOrdenadas.slice(0, 3);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded" />
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
          <CardTitle className="text-lg font-semibold">
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
            {/* Layout horizontal: 3 colunas no desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tarefasExibir.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className="flex flex-col p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate flex-1 mr-2">{tarefa.titulo}</p>
                    {getPrazoBadge(tarefa.prazo_entrega)}
                  </div>
                  {tarefa.descricao && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tarefa.descricao}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
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
