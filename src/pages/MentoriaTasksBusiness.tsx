import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, XCircle, RotateCcw, Eye, FileText, ExternalLink, ClipboardCheck, Loader2, Send, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useTasksByUser, useUpdateTask, TaskBusiness } from "@/hooks/useTasksBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPO_LABELS: Record<string, string> = {
  validacao: 'Validação',
  aprovacao: 'Aprovação',
  revisao: 'Revisão',
  homologacao: 'Homologação',
  assinatura: 'Assinatura',
  feedback: 'Feedback',
};

const PRIORIDADE_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  baixa: { label: 'Baixa', variant: 'outline' },
  media: { label: 'Média', variant: 'secondary' },
  alta: { label: 'Alta', variant: 'default' },
  urgente: { label: 'Urgente', variant: 'destructive' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  pendente: { label: 'Pendente', icon: <Clock className="h-4 w-4" />, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  em_analise: { label: 'Em Análise', icon: <Eye className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  aprovado: { label: 'Aprovado', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  rejeitado: { label: 'Rejeitado', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800' },
  revisao_solicitada: { label: 'Revisão Solicitada', icon: <RotateCcw className="h-4 w-4" />, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
};

export default function MentoriaTasksBusiness() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: loadingContrato } = useContratosBusiness(businessUserId);
  const { data: tasks, isLoading: loadingTasks } = useTasksByUser(businessUserId);
  const { entregas } = useEntregasBusiness(contrato?.id);
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const updateTask = useUpdateTask();

  const [respondingTask, setRespondingTask] = useState<TaskBusiness | null>(null);
  const [resposta, setResposta] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");

  const isLoading = loadingContrato || loadingTasks;

  // Agrupar tasks por status
  const tasksPendentes = useMemo(() => 
    tasks?.filter(t => t.status === 'pendente' || t.status === 'revisao_solicitada') || [], 
    [tasks]
  );
  const tasksEmAnalise = useMemo(() => 
    tasks?.filter(t => t.status === 'em_analise') || [], 
    [tasks]
  );
  const tasksConcluidas = useMemo(() => 
    tasks?.filter(t => t.status === 'aprovado' || t.status === 'rejeitado') || [], 
    [tasks]
  );

  // Filtrar tasks
  const tasksFiltradas = useMemo(() => {
    if (filtroStatus === "todas") return tasks || [];
    if (filtroStatus === "pendentes") return tasksPendentes;
    if (filtroStatus === "em_analise") return tasksEmAnalise;
    if (filtroStatus === "concluidas") return tasksConcluidas;
    return tasks || [];
  }, [tasks, filtroStatus, tasksPendentes, tasksEmAnalise, tasksConcluidas]);

  const getEntregaNome = (entregaId: string | null) => {
    if (!entregaId || !entregas) return null;
    const entrega = entregas.find(e => e.id === entregaId);
    return entrega?.titulo;
  };

  const getEtapaNome = (etapaId: string | null) => {
    if (!etapaId || !etapas) return null;
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa ? `Fase ${etapa.numero_etapa}: ${etapa.titulo}` : null;
  };

  const handleResponder = async () => {
    if (!respondingTask || !resposta.trim()) return;
    
    await updateTask.mutateAsync({
      id: respondingTask.id,
      status: 'em_analise',
      resposta_mentorado: resposta,
      data_resposta: new Date().toISOString(),
    });
    
    setRespondingTask(null);
    setResposta("");
  };

  const renderTaskCard = (task: TaskBusiness) => {
    const statusConfig = STATUS_CONFIG[task.status];
    const prioridadeConfig = PRIORIDADE_CONFIG[task.prioridade];
    const entregaNome = getEntregaNome(task.entrega_id);
    const etapaNome = getEtapaNome(task.etapa_id);
    const isPendente = task.status === 'pendente' || task.status === 'revisao_solicitada';

    return (
      <Card key={task.id} className={cn("border", statusConfig.bgColor)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={statusConfig.color}>{statusConfig.icon}</span>
                <h4 className="font-semibold">{task.titulo}</h4>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={cn("text-xs", statusConfig.color)} variant="outline">
                  {statusConfig.label}
                </Badge>
                {task.tipo && (
                  <Badge variant="outline" className="text-xs">
                    {TIPO_LABELS[task.tipo] || task.tipo}
                  </Badge>
                )}
                <Badge variant={prioridadeConfig.variant} className="text-xs">
                  {prioridadeConfig.label}
                </Badge>
                {task.prazo && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.prazo), "dd/MM/yyyy", { locale: ptBR })}
                  </Badge>
                )}
              </div>

              {/* Descrição */}
              {task.descricao && (
                <p className="text-sm text-muted-foreground mb-3">{task.descricao}</p>
              )}

              {/* Contexto: Entrega/Etapa */}
              {(entregaNome || etapaNome) && (
                <div className="text-xs text-muted-foreground mb-3 flex flex-wrap gap-2">
                  {etapaNome && <span className="bg-muted px-2 py-1 rounded">{etapaNome}</span>}
                  {entregaNome && <span className="bg-muted px-2 py-1 rounded">Entrega: {entregaNome}</span>}
                </div>
              )}

              {/* Instruções de validação */}
              {task.instrucoes_validacao && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">O que precisa fazer:</p>
                  <p className="text-sm text-blue-900 dark:text-blue-100">{task.instrucoes_validacao}</p>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-2 mb-3">
                {task.documento_url && (
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <a href={task.documento_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Ver Documento
                    </a>
                  </Button>
                )}
                {task.link_referencia && (
                  <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                    <a href={task.link_referencia} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Link de Referência
                    </a>
                  </Button>
                )}
              </div>

              {/* Resposta existente */}
              {task.resposta_mentorado && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-semibold mb-1">Sua resposta:</p>
                  <p className="text-sm text-muted-foreground">{task.resposta_mentorado}</p>
                  {task.data_resposta && (
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      Enviado em {format(new Date(task.data_resposta), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Ações */}
            {isPendente && (
              <Button 
                onClick={() => { setRespondingTask(task); setResposta(task.resposta_mentorado || ""); }}
                className="shrink-0"
              >
                <Send className="h-4 w-4 mr-2" />
                Responder
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mentoria")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6" />
              Minhas Tasks
            </h1>
            <p className="text-muted-foreground text-sm">
              Tarefas de validação e aprovação do seu projeto
            </p>
          </div>
        </div>
      </div>

      {/* Filtros e Contadores */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar:</span>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="todas">Todas ({tasks?.length || 0})</SelectItem>
                  <SelectItem value="pendentes">Pendentes ({tasksPendentes.length})</SelectItem>
                  <SelectItem value="em_analise">Em Análise ({tasksEmAnalise.length})</SelectItem>
                  <SelectItem value="concluidas">Concluídas ({tasksConcluidas.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 text-sm">
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                {tasksPendentes.length} pendentes
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                {tasksEmAnalise.length} em análise
              </Badge>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                {tasksConcluidas.length} concluídas
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tasks */}
      <div className="space-y-4">
        {tasksFiltradas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {filtroStatus !== "todas" 
                  ? "Nenhuma task encontrada com este filtro."
                  : "Nenhuma task pendente no momento."}
              </p>
            </CardContent>
          </Card>
        ) : (
          tasksFiltradas.map(task => renderTaskCard(task))
        )}
      </div>

      {/* Modal de Resposta */}
      <Dialog open={!!respondingTask} onOpenChange={() => setRespondingTask(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Responder Task</DialogTitle>
          </DialogHeader>
          
          {respondingTask && (
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">{respondingTask.titulo}</p>
                {respondingTask.instrucoes_validacao && (
                  <p className="text-sm text-muted-foreground">{respondingTask.instrucoes_validacao}</p>
                )}
              </div>

              <Textarea
                placeholder="Digite sua resposta ou comentário..."
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondingTask(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleResponder}
              disabled={!resposta.trim() || updateTask.isPending}
            >
              {updateTask.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
