import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckSquare, User, Calendar, AlertTriangle, Clock, CheckCircle2, AlertCircle, Flame } from "lucide-react";
import { useMentoriaTodasTarefas } from "@/hooks/useMentoriaTodasTarefas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { differenceInDays } from "date-fns";
import { adminTheme } from "@/components/admin/adminTheme";

export default function MinhasTarefas() {
  const { data: tarefas, isLoading } = useMentoriaTodasTarefas();
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "pendente" | "em_andamento" | "concluida">("todas");

  const pendentes = tarefas?.filter(t => t.status === 'pendente') || [];
  const emAndamento = tarefas?.filter(t => t.status === 'em_andamento') || [];
  const concluidas = tarefas?.filter(t => t.status === 'concluida') || [];
  const atrasadas = pendentes.filter(t => new Date(t.prazo_entrega) < new Date());

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
      <Badge variant="outline" className={`${config.bg} ${config.color} border-0 text-xs`}>
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
      <Badge variant="outline" className={`${config.bg} ${config.color} border-0 text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDiasRestantes = (prazo: string) => {
    const dias = differenceInDays(new Date(prazo), new Date());
    if (dias < 0) return <span className="text-red-600 font-semibold text-xs">Atrasada ({Math.abs(dias)}d)</span>;
    if (dias === 0) return <span className="text-orange-600 font-semibold text-xs">Vence hoje!</span>;
    if (dias <= 3) return <span className="text-yellow-600 text-xs">Vence em {dias}d</span>;
    return <span className="text-muted-foreground text-xs">Vence em {dias}d</span>;
  };

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <CheckSquare className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Todas as Tarefas dos Mentorados</h1>
        <Badge variant="secondary" className="text-xs">{tarefas?.length || 0}</Badge>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${adminTheme.card} cursor-pointer ${filtroStatus === 'pendente' ? 'ring-2 ring-yellow-600' : ''}`} onClick={() => setFiltroStatus('pendente')}>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-yellow-600">{pendentes.length}</div>
          </CardContent>
        </Card>

        <Card className={`${adminTheme.card} cursor-pointer`} onClick={() => setFiltroStatus('pendente')}>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-red-600">{atrasadas.length}</div>
          </CardContent>
        </Card>

        <Card className={`${adminTheme.card} cursor-pointer ${filtroStatus === 'em_andamento' ? 'ring-2 ring-blue-600' : ''}`} onClick={() => setFiltroStatus('em_andamento')}>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-blue-600">{emAndamento.length}</div>
          </CardContent>
        </Card>

        <Card className={`${adminTheme.card} cursor-pointer ${filtroStatus === 'concluida' ? 'ring-2 ring-green-600' : ''}`} onClick={() => setFiltroStatus('concluida')}>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl font-bold text-green-600">{concluidas.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-medium text-muted-foreground">Filtrar:</span>
        {[
          { key: "todas", label: `Todas (${tarefas?.length || 0})` },
          { key: "pendente", label: `Pendentes (${pendentes.length})` },
          { key: "em_andamento", label: `Em Andamento (${emAndamento.length})` },
          { key: "concluida", label: `Concluídas (${concluidas.length})` },
        ].map(f => (
          <Badge 
            key={f.key}
            variant={filtroStatus === f.key ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setFiltroStatus(f.key as any)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      {/* Tabela de Tarefas */}
      <Card className={adminTheme.card}>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Lista de Tarefas ({tarefasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className={adminTheme.tableContainer}>
            <Table>
              <TableHeader className={adminTheme.tableHeader}>
                <TableRow>
                  <TableHead className={adminTheme.tableHeaderCell}>Tarefa</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Mentorado</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Prazo</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Prioridade</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Tipo</TableHead>
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
                    <TableRow key={tarefa.id} className={adminTheme.tableRow}>
                      <TableCell>
                        <div className="font-medium text-sm">{tarefa.titulo}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{tarefa.descricao}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <User className="h-3 w-3" />
                          {tarefa.nome_completo}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(tarefa.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tarefa.prazo_entrega), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div>{getDiasRestantes(tarefa.prazo_entrega)}</div>
                      </TableCell>
                      <TableCell>{getPrioridadeBadge(tarefa.prioridade)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{tarefa.tipo}</Badge>
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
