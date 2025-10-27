import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { differenceInDays } from "date-fns";

export function TarefasUrgentes() {
  const navigate = useNavigate();
  const { tarefas, isLoading } = useMentoriaTarefas();

  if (isLoading) {
    return null;
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Tarefas</CardTitle>
              <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/mentoria/tarefas")}
            variant="outline"
            className="w-full"
          >
            Ver Todas as Tarefas
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Tarefas Pendentes</CardTitle>
              <p className="text-sm text-muted-foreground">{tarefasPendentes.length} tarefas urgentes</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
            <div key={tarefa.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{tarefa.titulo}</span>
                </div>
                <Badge variant={urgenciaVariant} className="text-xs">
                  {urgenciaTexto}
                </Badge>
              </div>
            </div>
          );
        })}
        
        <Button 
          onClick={() => navigate("/mentoria/tarefas")}
          variant="outline"
          className="w-full mt-4"
        >
          Ver Todas as Tarefas
        </Button>
      </CardContent>
    </Card>
  );
}
