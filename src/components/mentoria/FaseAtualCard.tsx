import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Calendar, CheckCircle2, Circle, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFasesProcesso } from "@/hooks/useFasesProcesso";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function FaseAtualCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fases, isLoading } = useFasesProcesso(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const faseAtual = fases.find((f) => f.status === "em_andamento");
  const fasesConcluidas = fases.filter((f) => f.status === "concluida").length;

  if (!faseAtual) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Target className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Nenhuma fase em andamento</h3>
            <p className="text-sm text-muted-foreground">
              Seu roadmap será iniciado em breve
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/mentoria/processo")}>
            Ver Roadmap Completo
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    pendente: "bg-muted text-muted-foreground",
    em_andamento: "bg-primary text-primary-foreground",
    concluida: "bg-green-500 text-white",
    bloqueada: "bg-destructive text-destructive-foreground",
  };

  const tarefasConcluidas = faseAtual.tarefas?.filter((t) => t.status === "concluida").length || 0;
  const totalTarefas = faseAtual.tarefas?.length || 0;
  const progresso = faseAtual.progresso_tarefas || 0;

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 fill-primary text-primary animate-pulse" />
              <CardTitle className="text-2xl">Você está na {faseAtual.nome_fase}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {faseAtual.descricao || "Continue seu progresso no processo de mentoria"}
            </p>
          </div>
          <Badge className={statusColors[faseAtual.status]}>
            Fase {faseAtual.fase_numero}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso da fase</span>
            <span className="font-semibold">{progresso}%</span>
          </div>
          <Progress value={progresso} className="h-3" />
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {faseAtual.data_inicio && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Iniciada em</span>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(faseAtual.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
          
          {totalTarefas > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Tarefas</span>
              </div>
              <p className="text-sm font-medium">
                {tarefasConcluidas} de {totalTarefas} concluídas
              </p>
            </div>
          )}
        </div>

        {/* Badge de progresso geral */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Progresso geral: {fasesConcluidas} de {fases.length} fases
            </span>
          </div>
        </div>

        {/* Botão para ver roadmap completo */}
        <Button
          onClick={() => navigate("/mentoria/processo")}
          className="w-full"
          size="lg"
        >
          Ver Roadmap Completo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
