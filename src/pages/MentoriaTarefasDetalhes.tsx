import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  LayoutGrid, 
  List, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  ExternalLink,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { differenceInDays, parseISO, format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

type ViewMode = "tabela" | "kanban";

export default function MentoriaTarefasDetalhes() {
  const navigate = useNavigate();
  const { tarefas, isLoading } = useMentoriaTarefas();
  const [viewMode, setViewMode] = useState<ViewMode>("tabela");

  const tarefasPendentes = tarefas?.filter(t => t.status === "pendente") || [];
  const tarefasEmAndamento = tarefas?.filter(t => t.status === "em_andamento") || [];
  const tarefasConcluidas = tarefas?.filter(t => t.status === "concluida") || [];

  const getPrioridadeBadge = (prioridade: string | null) => {
    switch (prioridade) {
      case "alta":
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case "media":
        return <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Média</Badge>;
      case "baixa":
        return <Badge variant="outline" className="text-xs">Baixa</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, prazoEntrega: string | null) => {
    const atrasada = prazoEntrega && isPast(parseISO(prazoEntrega)) && status !== "concluida";
    
    if (atrasada) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Atrasada
        </Badge>
      );
    }
    
    switch (status) {
      case "concluida":
        return (
          <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        );
      case "em_andamento":
        return (
          <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Clock className="h-3 w-3 mr-1" />
            Em Andamento
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Pendente
          </Badge>
        );
    }
  };

  const formatPrazo = (prazo: string | null) => {
    if (!prazo) return "-";
    const data = parseISO(prazo);
    const dias = differenceInDays(data, new Date());
    const dataFormatada = format(data, "dd/MM/yyyy", { locale: ptBR });
    
    if (dias < 0) return `${dataFormatada} (${Math.abs(dias)}d atraso)`;
    if (dias === 0) return `${dataFormatada} (Hoje)`;
    return `${dataFormatada} (${dias}d)`;
  };

  // Componente de Card para Kanban
  const KanbanCard = ({ tarefa }: { tarefa: (typeof tarefas)[number] }) => (
    <Card className="mb-3 border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium line-clamp-2">{tarefa.titulo}</h4>
          {getPrioridadeBadge(tarefa.prioridade)}
        </div>
        {tarefa.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {tarefa.descricao}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {tarefa.prazo_entrega && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(parseISO(tarefa.prazo_entrega), "dd MMM", { locale: ptBR })}
            </div>
          )}
          {tarefa.arquivo_entrega_url && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => window.open(tarefa.arquivo_entrega_url!, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Coluna do Kanban
  const KanbanColumn = ({ 
    title, 
    tasks, 
    icon: Icon, 
    colorClass 
  }: { 
    title: string; 
    tasks: typeof tarefas; 
    icon: typeof Clock;
    colorClass: string;
  }) => (
    <div className="flex-1 min-w-[280px]">
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b ${colorClass}`}>
        <Icon className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma tarefa
          </p>
        ) : (
          tasks.map(tarefa => <KanbanCard key={tarefa.id} tarefa={tarefa} />)
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/mentoria")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tarefas da Mentoria</h1>
            <p className="text-muted-foreground text-sm">
              {tarefas?.length || 0} tarefa{(tarefas?.length || 0) !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        
        {/* Toggle de Visualização */}
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
          <Button
            variant={viewMode === "tabela" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("tabela")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Tabela
          </Button>
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </Button>
        </div>
      </div>

      {/* Visualização em Tabela */}
      {viewMode === "tabela" && (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Tarefa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-right">Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarefas?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma tarefa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  tarefas?.map((tarefa) => (
                    <TableRow key={tarefa.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tarefa.titulo}</p>
                          {tarefa.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {tarefa.descricao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(tarefa.status, tarefa.prazo_entrega)}</TableCell>
                      <TableCell>{getPrioridadeBadge(tarefa.prioridade)}</TableCell>
                      <TableCell className="text-sm">{formatPrazo(tarefa.prazo_entrega)}</TableCell>
                      <TableCell className="text-right">
                        {tarefa.arquivo_entrega_url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(tarefa.arquivo_entrega_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        ) : tarefa.status !== "concluida" ? (
                          <Button variant="outline" size="sm" disabled>
                            <Upload className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Visualização em Kanban */}
      {viewMode === "kanban" && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn 
            title="Pendentes" 
            tasks={tarefasPendentes} 
            icon={Clock}
            colorClass="border-muted-foreground/30"
          />
          <KanbanColumn 
            title="Em Andamento" 
            tasks={tarefasEmAndamento} 
            icon={Clock}
            colorClass="border-blue-500/50"
          />
          <KanbanColumn 
            title="Concluídas" 
            tasks={tarefasConcluidas} 
            icon={CheckCircle2}
            colorClass="border-green-500/50"
          />
        </div>
      )}
    </div>
  );
}
