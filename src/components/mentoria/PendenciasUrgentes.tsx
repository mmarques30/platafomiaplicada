import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar, MessageCircle } from "lucide-react";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useDuvidasMentoria } from "@/hooks/useDuvidasMentoria";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { differenceInDays, differenceInHours } from "date-fns";

export function PendenciasUrgentes() {
  const navigate = useNavigate();
  const { tarefas } = useMentoriaTarefas();
  const { duvidas } = useDuvidasMentoria();

  const tarefasAtrasadas = tarefas.filter(t => t.status === "atrasada");
  const tarefasVencemHoje = tarefas.filter(t => {
    if (t.status !== "pendente" && t.status !== "em_andamento") return false;
    const diff = differenceInDays(new Date(t.prazo_entrega), new Date());
    return diff === 0;
  });
  
  const duvidasPendentes = duvidas.filter(d => d.status === "pendente" || d.status === "em_analise");
  const duvidasComPrazoProximo = duvidasPendentes.filter(d => {
    const horasRestantes = differenceInHours(new Date(d.prazo_sla), new Date());
    return horasRestantes < 6 && horasRestantes > 0;
  });

  const totalPendencias = tarefasAtrasadas.length + tarefasVencemHoje.length + duvidasPendentes.length;

  if (totalPendencias === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Pendências Urgentes ({totalPendencias})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tarefasAtrasadas.map(tarefa => (
          <Alert key={tarefa.id} variant="destructive">
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  <strong>Tarefa:</strong> {tarefa.titulo} - Atrasada {Math.abs(differenceInDays(new Date(tarefa.prazo_entrega), new Date()))} dias
                </span>
                <Button size="sm" variant="outline" onClick={() => navigate("/mentoria/tarefas")}>
                  Ver
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

        {tarefasVencemHoje.map(tarefa => (
          <Alert key={tarefa.id}>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  <strong>Tarefa:</strong> {tarefa.titulo} - Vence hoje!
                </span>
                <Button size="sm" variant="outline" onClick={() => navigate("/mentoria/tarefas")}>
                  Ver
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

        {duvidasComPrazoProximo.map(duvida => (
          <Alert key={duvida.id}>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Dúvida aguardando resposta - SLA: {Math.round(differenceInHours(new Date(duvida.prazo_sla), new Date()))}h restantes
                </span>
                <Button size="sm" variant="outline" onClick={() => navigate("/mentoria/duvidas")}>
                  Ver
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
