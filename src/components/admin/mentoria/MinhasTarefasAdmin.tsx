import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, AlertTriangle, CheckCircle2, Clock, Pencil, Trash2, ExternalLink, FileText } from "lucide-react";
import { useMentoriaTarefas, TarefaMentoria } from "@/hooks/useMentoriaTarefas";
import { TarefaModal } from "./TarefaModal";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function MinhasTarefasAdmin() {
  const { user } = useAuth();
  const { tarefas, isLoading, updateTarefa, deleteTarefa, createTarefa, uploadEntrega } = useMentoriaTarefas(user?.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<TarefaMentoria | undefined>();

  const handleSaveTarefa = (data: Partial<TarefaMentoria>) => {
    if (editingTarefa) {
      updateTarefa({
        id: editingTarefa.id,
        ...data,
      } as any);
    } else {
      if (!user?.id) return;
      createTarefa({
        ...data,
        user_id: user.id,
      } as any);
    }
  };

  const handleDeleteTarefa = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta tarefa?")) return;
    deleteTarefa(id);
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      critica: { variant: "destructive", icon: AlertTriangle },
      alta: { variant: "default", icon: AlertTriangle },
      media: { variant: "secondary", icon: Clock },
      baixa: { variant: "outline", icon: Clock },
    };
    
    const config = variants[prioridade] || variants.media;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {prioridade}
      </Badge>
    );
  };

  const getDaysUntilDeadline = (prazo: string) => {
    const days = differenceInDays(new Date(prazo), new Date());
    if (days < 0) return { text: `${Math.abs(days)} dias atrasada`, variant: "destructive" as const };
    if (days === 0) return { text: "Vence hoje", variant: "default" as const };
    if (days <= 2) return { text: `${days} dias`, variant: "default" as const };
    return { text: `${days} dias`, variant: "secondary" as const };
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const tarefasPorStatus = {
    pendente: tarefas?.filter(t => t.status === "pendente") || [],
    em_andamento: tarefas?.filter(t => t.status === "em_andamento") || [],
    concluida: tarefas?.filter(t => t.status === "concluida") || [],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minhas Tarefas</h2>
          <p className="text-muted-foreground">Gerencie suas tarefas como mentora</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(tarefasPorStatus).map(([status, tarefasStatus]) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {status === "pendente" && <Clock className="h-4 w-4" />}
                {status === "em_andamento" && <AlertTriangle className="h-4 w-4" />}
                {status === "concluida" && <CheckCircle2 className="h-4 w-4" />}
                {status.replace("_", " ").toUpperCase()} ({tarefasStatus.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tarefasStatus.map((tarefa) => {
                const deadline = getDaysUntilDeadline(tarefa.prazo_entrega);
                
                return (
                  <Card key={tarefa.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm flex-1">{tarefa.titulo}</h4>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditingTarefa(tarefa)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDeleteTarefa(tarefa.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {getPrioridadeBadge(tarefa.prioridade)}
                        <Badge variant="outline">{tarefa.tipo}</Badge>
                        <Badge variant={tarefa.status === "concluida" ? "default" : "secondary"}>
                          {tarefa.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {tarefa.descricao}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(tarefa.prazo_entrega), "dd/MM/yyyy", { locale: ptBR })}</span>
                        <Badge variant={deadline.variant} className="ml-auto">
                          {deadline.text}
                        </Badge>
                      </div>

                      {tarefa.link_externo && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(tarefa.link_externo!, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Abrir Link
                        </Button>
                      )}

                      {tarefa.arquivo_entrega_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(tarefa.arquivo_entrega_url!, "_blank")}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Ver Entrega
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
              
              {tarefasStatus.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tarefa neste status
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <TarefaModal
        open={modalOpen || !!editingTarefa}
        onOpenChange={(open) => {
          if (!open) {
            setModalOpen(false);
            setEditingTarefa(undefined);
          }
        }}
        tarefa={editingTarefa}
        onSave={handleSaveTarefa}
        userId={user?.id || ""}
      />
    </div>
  );
}
