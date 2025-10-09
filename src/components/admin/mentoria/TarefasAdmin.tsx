import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertTriangle, CheckCircle2, Clock, Pencil, Trash2, ExternalLink, FileText } from "lucide-react";
import { useMentoriaTarefas, TarefaMentoria } from "@/hooks/useMentoriaTarefas";
import { TarefaModal } from "./TarefaModal";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TarefasAdminProps {
  userId: string;
}

export const TarefasAdmin = ({ userId }: TarefasAdminProps) => {
  const { tarefas, isLoading, createTarefa, updateTarefa, deleteTarefa } = useMentoriaTarefas(userId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<TarefaMentoria | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todos");

  const handleSave = (tarefa: Partial<TarefaMentoria>) => {
    if (editingTarefa) {
      updateTarefa({ id: editingTarefa.id, ...tarefa });
    } else {
      createTarefa(tarefa);
    }
    setEditingTarefa(null);
  };

  const handleEdit = (tarefa: TarefaMentoria) => {
    setEditingTarefa(tarefa);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingTarefa(null);
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTarefa(deleteId);
      setDeleteId(null);
    }
  };

  const tarefasFiltradas = tarefas.filter(t => {
    if (filtroTipo !== "todos" && t.tipo !== filtroTipo) return false;
    if (filtroPrioridade !== "todos" && t.prioridade !== filtroPrioridade) return false;
    return true;
  });

  const pendentes = tarefasFiltradas.filter(t => t.status === "pendente" || t.status === "em_andamento");
  const atrasadas = tarefasFiltradas.filter(t => t.status === "atrasada");
  const concluidas = tarefasFiltradas.filter(t => t.status === "concluida");

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      critica: { variant: "destructive", icon: AlertTriangle },
      alta: { variant: "default", icon: AlertTriangle },
      media: { variant: "secondary", icon: Clock },
      baixa: { variant: "outline", icon: CheckCircle2 }
    };
    const config = variants[prioridade] || variants.media;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {prioridade.toUpperCase()}
      </Badge>
    );
  };

  const getDiasRestantes = (prazo: string) => {
    const dias = differenceInDays(new Date(prazo), new Date());
    if (dias < 0) return <span className="text-destructive font-semibold">Atrasada</span>;
    if (dias === 0) return <span className="text-warning font-semibold">Hoje</span>;
    if (dias === 1) return <span className="text-warning">Amanhã</span>;
    if (dias <= 7) return <span className="text-warning">{dias} dias</span>;
    return <span className="text-muted-foreground">{dias} dias</span>;
  };

  const TarefaCard = ({ tarefa }: { tarefa: TarefaMentoria }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getPrioridadeBadge(tarefa.prioridade)}
              <Badge variant="outline">{tarefa.tipo}</Badge>
              <Badge variant={tarefa.status === "concluida" ? "default" : "secondary"}>
                {tarefa.status}
              </Badge>
            </div>
            <h4 className="font-semibold text-lg">{tarefa.titulo}</h4>
            <p className="text-sm text-muted-foreground mt-1">{tarefa.descricao}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(tarefa)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDeleteId(tarefa.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Prazo: {format(new Date(tarefa.prazo_entrega), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {getDiasRestantes(tarefa.prazo_entrega)}
          </div>
        </div>

        {tarefa.link_externo && (
          <div className="mt-2">
            <a href={tarefa.link_externo} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
              <ExternalLink className="h-3 w-3" />
              Link externo
            </a>
          </div>
        )}

        {tarefa.arquivo_entrega_url && (
          <div className="mt-2">
            <a href={tarefa.arquivo_entrega_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
              <FileText className="h-3 w-3" />
              Arquivo anexado
            </a>
          </div>
        )}

        {tarefa.feedback_mentor && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-1">Feedback do Mentor:</p>
            <p className="text-sm">{tarefa.feedback_mentor}</p>
            {tarefa.avaliacao_mentor && (
              <p className="text-sm mt-1">Avaliação: {tarefa.avaliacao_mentor}/5</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendentes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-destructive">Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{atrasadas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{concluidas.length}</div>
            </CardContent>
          </Card>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="entrega">Entrega</SelectItem>
            <SelectItem value="leitura">Leitura</SelectItem>
            <SelectItem value="exercicio">Exercício</SelectItem>
            <SelectItem value="revisao">Revisão</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas prioridades</SelectItem>
            <SelectItem value="critica">Crítica</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="atrasadas">Atrasadas ({atrasadas.length})</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas ({concluidas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4 mt-4">
          {pendentes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma tarefa pendente</p>
          ) : (
            pendentes.map(tarefa => <TarefaCard key={tarefa.id} tarefa={tarefa} />)
          )}
        </TabsContent>

        <TabsContent value="atrasadas" className="space-y-4 mt-4">
          {atrasadas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma tarefa atrasada</p>
          ) : (
            atrasadas.map(tarefa => <TarefaCard key={tarefa.id} tarefa={tarefa} />)
          )}
        </TabsContent>

        <TabsContent value="concluidas" className="space-y-4 mt-4">
          {concluidas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma tarefa concluída</p>
          ) : (
            concluidas.map(tarefa => <TarefaCard key={tarefa.id} tarefa={tarefa} />)
          )}
        </TabsContent>
      </Tabs>

      <TarefaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        tarefa={editingTarefa}
        userId={userId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
