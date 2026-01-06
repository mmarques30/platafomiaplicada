import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, ListTodo } from "lucide-react";

export function TarefasUrgentes() {
  const navigate = useNavigate();
  const { tarefas, isLoading } = useMentoriaTarefas();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar tarefas não concluídas e ordenar por data
  const tarefasFiltradas = tarefas
    .filter(t => t.status !== "concluida")
    .filter(t => filtroStatus === "todos" || t.status === filtroStatus)
    .map(t => ({
      ...t,
      diasRestantes: differenceInDays(new Date(t.prazo_entrega), new Date())
    }))
    .sort((a, b) => new Date(a.prazo_entrega).getTime() - new Date(b.prazo_entrega).getTime())
    .slice(0, 3);

  const getUrgencia = (tarefa: typeof tarefasFiltradas[0]) => {
    let variant: "default" | "secondary" | "destructive" = "default";
    let texto = "";
    
    if (tarefa.status === "atrasada" || tarefa.diasRestantes < 0) {
      variant = "destructive";
      texto = "Atrasada";
    } else if (tarefa.diasRestantes === 0) {
      variant = "destructive";
      texto = "Hoje";
    } else if (tarefa.diasRestantes === 1) {
      variant = "default";
      texto = "Amanhã";
    } else if (tarefa.diasRestantes <= 3) {
      variant = "default";
      texto = `${tarefa.diasRestantes}d`;
    } else {
      variant = "secondary";
      texto = `${tarefa.diasRestantes}d`;
    }

    return { variant, texto };
  };

  const totalPendentes = tarefas.filter(t => t.status !== "concluida").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Tarefas Pendentes</CardTitle>
            {totalPendentes > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalPendentes}
              </Badge>
            )}
          </div>
          
          {/* Filtro discreto */}
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {tarefasFiltradas.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Nenhuma tarefa pendente</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Tarefa</TableHead>
                <TableHead className="w-[20%]">Prazo</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[15%] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarefasFiltradas.map(tarefa => {
                const urgencia = getUrgencia(tarefa);
                return (
                  <TableRow 
                    key={tarefa.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate("/mentoria/tarefas")}
                  >
                    <TableCell className="font-medium text-sm truncate max-w-[200px]">
                      {tarefa.titulo}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(tarefa.prazo_entrega), "dd/MM", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={urgencia.variant} className="text-xs">
                        {urgencia.texto}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <Button 
            onClick={() => navigate("/mentoria/tarefas")}
            variant="ghost"
            className="w-full text-sm"
          >
            Ver Todas as Tarefas
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
