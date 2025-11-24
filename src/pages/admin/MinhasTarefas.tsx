import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckSquare, User, Calendar, AlertTriangle, Clock, CheckCircle2, AlertCircle, Flame } from "lucide-react";
import { useMentoriaTodasTarefas } from "@/hooks/useMentoriaTodasTarefas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { differenceInDays } from "date-fns";

export default function MinhasTarefas() {
  const { data: tarefas, isLoading } = useMentoriaTodasTarefas();
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "pendente" | "em_andamento" | "concluida">("todas");

  // Agrupar por status
  const pendentes = tarefas?.filter(t => t.status === 'pendente') || [];
  const emAndamento = tarefas?.filter(t => t.status === 'em_andamento') || [];
  const concluidas = tarefas?.filter(t => t.status === 'concluida') || [];

  // Contar atrasadas (pendentes com prazo vencido)
  const atrasadas = pendentes.filter(t => 
    new Date(t.prazo_entrega) < new Date()
  );

  // Filtrar tarefas baseado no filtro ativo
  const tarefasFiltradas = useMemo(() => {
    if (!tarefas) return [];
    if (filtroStatus === "todas") return tarefas;
    return tarefas.filter(t => t.status === filtroStatus);
  }, [tarefas, filtroStatus]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando tarefas...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pendente: { color: "text-yellow-600", bg: "bg-yellow-50", label: "Pendente", icon: AlertTriangle },
      em_andamento: { color: "text-blue-600", bg: "bg-blue-50", label: "Em Andamento", icon: Clock },
      concluida: { color: "text-green-600", bg: "bg-green-50", label: "Concluída", icon: CheckCircle2 },
    }[status] || { color: "text-muted-foreground", bg: "bg-muted", label: status, icon: AlertCircle };
    
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

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

        {/* Cards de estatísticas - Clicáveis para filtrar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer hover:shadow-md transition-all ${filtroStatus === 'pendente' ? 'ring-2 ring-yellow-600' : ''}`}
            onClick={() => setFiltroStatus('pendente')}
          >
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

          <Card 
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => setFiltroStatus('pendente')}
          >
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

          <Card 
            className={`cursor-pointer hover:shadow-md transition-all ${filtroStatus === 'em_andamento' ? 'ring-2 ring-blue-600' : ''}`}
            onClick={() => setFiltroStatus('em_andamento')}
          >
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

          <Card 
            className={`cursor-pointer hover:shadow-md transition-all ${filtroStatus === 'concluida' ? 'ring-2 ring-green-600' : ''}`}
            onClick={() => setFiltroStatus('concluida')}
          >
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

        {/* Barra de Filtros */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
          <Badge 
            variant={filtroStatus === "todas" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFiltroStatus("todas")}
          >
            Todas ({tarefas?.length || 0})
          </Badge>
          <Badge 
            variant={filtroStatus === "pendente" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFiltroStatus("pendente")}
          >
            Pendentes ({pendentes.length})
          </Badge>
          <Badge 
            variant={filtroStatus === "em_andamento" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFiltroStatus("em_andamento")}
          >
            Em Andamento ({emAndamento.length})
          </Badge>
          <Badge 
            variant={filtroStatus === "concluida" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFiltroStatus("concluida")}
          >
            Concluídas ({concluidas.length})
          </Badge>
        </div>

        {/* Tabela de Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Lista de Tarefas ({tarefasFiltradas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Mentorado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarefasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma tarefa encontrada para este filtro
                      </TableCell>
                    </TableRow>
                  ) : (
                    tarefasFiltradas.map((tarefa) => (
                      <TableRow key={tarefa.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{tarefa.titulo}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {tarefa.descricao}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <User className="h-3 w-3" />
                            {tarefa.nome_completo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(tarefa.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(tarefa.prazo_entrega), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="text-xs">
                              {getDiasRestantes(tarefa.prazo_entrega)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPrioridadeBadge(tarefa.prioridade)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {tarefa.tipo}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
