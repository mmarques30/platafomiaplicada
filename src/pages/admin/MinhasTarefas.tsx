import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, User, Calendar, AlertTriangle, Clock, CheckCircle2, AlertCircle, Flame } from "lucide-react";
import { useMentoriaTodasTarefas } from "@/hooks/useMentoriaTodasTarefas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { differenceInDays } from "date-fns";
import { TarefaMentoria } from "@/hooks/useMentoriaTarefas";

export default function MinhasTarefas() {
  const { data: tarefas, isLoading } = useMentoriaTodasTarefas();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando tarefas...</p>
      </div>
    );
  }

  // Agrupar por status
  const pendentes = tarefas?.filter(t => t.status === 'pendente') || [];
  const emAndamento = tarefas?.filter(t => t.status === 'em_andamento') || [];
  const concluidas = tarefas?.filter(t => t.status === 'concluida') || [];

  // Contar atrasadas (pendentes com prazo vencido)
  const atrasadas = pendentes.filter(t => 
    new Date(t.prazo_entrega) < new Date()
  );

  const getPrioridadeBadge = (prioridade: string) => {
    const config = {
      critica: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Crítica" },
      alta: { icon: Flame, color: "text-orange-600", bg: "bg-orange-50", label: "Alta" },
      media: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", label: "Média" },
      baixa: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Baixa" },
    }[prioridade] || { icon: Clock, color: "text-gray-600", bg: "bg-gray-50", label: prioridade };

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDiasRestantes = (prazo: string) => {
    const dias = differenceInDays(new Date(prazo), new Date());
    if (dias < 0) {
      return <span className="text-red-600 font-semibold">Atrasada ({Math.abs(dias)}d)</span>;
    } else if (dias === 0) {
      return <span className="text-orange-600 font-semibold">Vence hoje!</span>;
    } else if (dias <= 3) {
      return <span className="text-yellow-600">Vence em {dias}d</span>;
    }
    return <span className="text-muted-foreground">Vence em {dias}d</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Todas as Tarefas dos Mentorados
        </h1>
        <p className="text-muted-foreground mt-2">
          Visão geral de todas as tarefas de todos os mentorados
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{atrasadas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{emAndamento.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{concluidas.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Board Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Pendentes */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Pendentes ({pendentes.length})
          </h3>
          <div className="space-y-3">
            {pendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma tarefa pendente
              </p>
            ) : (
              pendentes.map(tarefa => (
                <TarefaCard key={tarefa.id} tarefa={tarefa} getPrioridadeBadge={getPrioridadeBadge} getDiasRestantes={getDiasRestantes} />
              ))
            )}
          </div>
        </div>

        {/* Coluna Em Andamento */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            Em Andamento ({emAndamento.length})
          </h3>
          <div className="space-y-3">
            {emAndamento.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma tarefa em andamento
              </p>
            ) : (
              emAndamento.map(tarefa => (
                <TarefaCard key={tarefa.id} tarefa={tarefa} getPrioridadeBadge={getPrioridadeBadge} getDiasRestantes={getDiasRestantes} />
              ))
            )}
          </div>
        </div>

        {/* Coluna Concluídas */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Concluídas ({concluidas.length})
          </h3>
          <div className="space-y-3">
            {concluidas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma tarefa concluída
              </p>
            ) : (
              concluidas.map(tarefa => (
                <TarefaCard key={tarefa.id} tarefa={tarefa} getPrioridadeBadge={getPrioridadeBadge} getDiasRestantes={getDiasRestantes} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada card de tarefa
function TarefaCard({ tarefa, getPrioridadeBadge, getDiasRestantes }: {
  tarefa: TarefaMentoria & { nome_completo: string };
  getPrioridadeBadge: (prioridade: string) => JSX.Element;
  getDiasRestantes: (prazo: string) => JSX.Element;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{tarefa.titulo}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{tarefa.descricao}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Badge com nome do mentorado */}
        <Badge variant="secondary" className="gap-1">
          <User className="h-3 w-3" />
          {tarefa.nome_completo}
        </Badge>
        
        {/* Prazo */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            {format(new Date(tarefa.prazo_entrega), "dd/MM/yyyy", { locale: ptBR })}
          </span>
          {" · "}
          {getDiasRestantes(tarefa.prazo_entrega)}
        </div>
        
        {/* Badges de tipo e prioridade */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">{tarefa.tipo}</Badge>
          {getPrioridadeBadge(tarefa.prioridade)}
        </div>
      </CardContent>
    </Card>
  );
}
