import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { differenceInDays } from "date-fns";

export function TarefasUrgentes() {
  const navigate = useNavigate();
  const { tarefas, isLoading } = useMentoriaTarefas();

  if (isLoading) {
    return (
      <Card className="h-full min-h-[400px]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-12 bg-muted animate-pulse rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-20 bg-muted animate-pulse rounded w-full" />
          <div className="h-20 bg-muted animate-pulse rounded w-full" />
          <div className="h-10 bg-muted animate-pulse rounded w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  // Filtrar e ordenar tarefas urgentes
  const tarefasPendentes = tarefas
    .filter(t => t.status === "pendente" || t.status === "em_andamento" || t.status === "atrasada")
    .map(t => ({
      ...t,
      diasRestantes: differenceInDays(new Date(t.prazo_entrega), new Date())
    }))
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 3);

  if (tarefasPendentes.length === 0) {
    return (
      <Card className="h-full min-h-[400px] flex flex-col">
        <CardHeader>
          <div>
            <CardTitle className="text-xl">Tarefas</CardTitle>
            <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente</p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Você não possui tarefas pendentes no momento.
          </p>
          <Button 
            onClick={() => navigate("/mentoria/tarefas")}
            variant="outline"
            className="w-full mt-auto"
          >
            Ver Todas as Tarefas
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[400px] flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Tarefas Pendentes</CardTitle>
            <p className="text-sm text-muted-foreground">{tarefasPendentes.length} tarefas urgentes</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {tarefasPendentes.map(tarefa => {
            let urgenciaVariant: "default" | "secondary" | "destructive" = "default";
            let urgenciaTexto = "";
            
            if (tarefa.status === "atrasada" || tarefa.diasRestantes < 0) {
              urgenciaVariant = "destructive";
              urgenciaTexto = `Atrasada ${Math.abs(tarefa.diasRestantes)} dias`;
            } else if (tarefa.diasRestantes === 0) {
              urgenciaVariant = "destructive";
              urgenciaTexto = "Vence hoje";
            } else if (tarefa.diasRestantes === 1) {
              urgenciaVariant = "default";
              urgenciaTexto = "Vence amanhã";
            } else if (tarefa.diasRestantes <= 3) {
              urgenciaVariant = "default";
              urgenciaTexto = `Vence em ${tarefa.diasRestantes} dias`;
            } else {
              urgenciaVariant = "secondary";
              urgenciaTexto = `Vence em ${tarefa.diasRestantes} dias`;
            }

            return (
              <div key={tarefa.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/mentoria/tarefas")}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm flex-1">{tarefa.titulo}</span>
                  <Badge variant={urgenciaVariant} className="text-xs">
                    {urgenciaTexto}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        
        <Button 
          onClick={() => navigate("/mentoria/tarefas")}
          variant="outline"
          className="w-full mt-auto"
        >
          Ver Todas as Tarefas
        </Button>
      </CardContent>
    </Card>
  );
}
