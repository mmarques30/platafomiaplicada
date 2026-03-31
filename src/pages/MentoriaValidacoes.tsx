import { useState, useMemo } from "react";
import { ArrowLeft, CheckSquare, Clock, CheckCircle, AlertCircle, FileText, Calendar, ExternalLink, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useTasksByUser, useRespondTask, TaskBusiness } from "@/hooks/useTasksBusiness";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const TIPO_LABELS: Record<string, string> = {
  validacao: 'Validação',
  aprovacao: 'Aprovação',
  revisao: 'Revisão',
  homologacao: 'Homologação',
  assinatura: 'Assinatura',
  feedback: 'Feedback',
};

const PRIORIDADE_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  baixa: { label: 'Baixa', variant: 'secondary' },
  media: { label: 'Média', variant: 'default' },
  alta: { label: 'Alta', variant: 'destructive' },
  urgente: { label: 'Urgente', variant: 'destructive' },
};

export default function MentoriaValidacoes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useTasksByUser(user?.id);
  const respondTask = useRespondTask();
  
  const [activeTab, setActiveTab] = useState("pendentes");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});

  const { pendentes, emAnalise, concluidas } = useMemo(() => {
    const pendentes = tasks.filter(t => t.status === 'pendente');
    const emAnalise = tasks.filter(t => t.status === 'em_analise');
    const concluidas = tasks.filter(t => ['aprovado', 'rejeitado', 'revisao_solicitada'].includes(t.status));
    return { pendentes, emAnalise, concluidas };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'pendentes': return pendentes;
      case 'em_analise': return emAnalise;
      case 'concluidas': return concluidas;
      default: return tasks;
    }
  }, [activeTab, pendentes, emAnalise, concluidas, tasks]);

  const handleRespond = async (taskId: string, status: 'aprovado' | 'rejeitado' | 'revisao_solicitada') => {
    await respondTask.mutateAsync({
      taskId,
      resposta: respostas[taskId] || '',
      status,
    });
    setExpandedTask(null);
    setRespostas(prev => ({ ...prev, [taskId]: '' }));
  };

  const getPrazoInfo = (prazo: string | null) => {
    if (!prazo) return null;
    const prazoDate = new Date(prazo);
    const dias = differenceInDays(prazoDate, new Date());
    const atrasado = isPast(prazoDate);
    
    return {
      formatted: format(prazoDate, "dd 'de' MMMM", { locale: ptBR }),
      dias,
      atrasado,
      label: atrasado ? `Atrasado ${Math.abs(dias)} dia(s)` : dias === 0 ? 'Vence hoje' : `${dias} dia(s) restantes`,
    };
  };

  const getStatusBadge = (status: TaskBusiness['status']) => {
    const map: Record<string, { status: string; label: string }> = {
      pendente: { status: 'pendente', label: 'Pendente' },
      em_analise: { status: 'em_andamento', label: 'Em Análise' },
      aprovado: { status: 'aprovado', label: 'Aprovado' },
      rejeitado: { status: 'critico', label: 'Rejeitado' },
      revisao_solicitada: { status: 'pendente', label: 'Revisão Solicitada' },
    };
    const config = map[status] || { status: 'pendente', label: status };
    return <StatusBadge status={config.status} label={config.label} />;
  };

  const renderTaskCard = (task: TaskBusiness) => {
    const prazoInfo = getPrazoInfo(task.prazo);
    const isExpanded = expandedTask === task.id;
    const prioridadeConfig = PRIORIDADE_CONFIG[task.prioridade] || PRIORIDADE_CONFIG.media;

    return (
      <Card 
        key={task.id} 
        className={`border-border/50 transition-all ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {task.tipo && (
                  <Badge variant="outline" className="text-xs">
                    {TIPO_LABELS[task.tipo] || task.tipo}
                  </Badge>
                )}
                <Badge variant={prioridadeConfig.variant} className="text-xs">
                  {prioridadeConfig.label}
                </Badge>
              </div>
              <CardTitle className="text-base font-medium">{task.titulo}</CardTitle>
            </div>
            {getStatusBadge(task.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.descricao && (
            <p className="text-sm text-muted-foreground">{task.descricao}</p>
          )}

          {prazoInfo && (
            <div className={`flex items-center gap-2 text-sm ${prazoInfo.atrasado ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4" />
              <span>{prazoInfo.formatted}</span>
              <span className="text-xs">({prazoInfo.label})</span>
            </div>
          )}

          {task.instrucoes_validacao && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Instruções</p>
              <p className="text-sm">{task.instrucoes_validacao}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {task.documento_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={task.documento_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-1" />
                  Documento
                </a>
              </Button>
            )}
            {task.link_referencia && (
              <Button variant="outline" size="sm" asChild>
                <a href={task.link_referencia} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Referência
                </a>
              </Button>
            )}
          </div>

          {task.status === 'pendente' && (
            <>
              {!isExpanded ? (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setExpandedTask(task.id)}
                  className="w-full"
                >
                  Responder
                </Button>
              ) : (
                <div className="space-y-3 pt-2 border-t">
                  <Textarea
                    placeholder="Escreva sua resposta ou observações..."
                    value={respostas[task.id] || ''}
                    onChange={(e) => setRespostas(prev => ({ ...prev, [task.id]: e.target.value }))}
                    rows={3}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(task.id, 'aprovado')}
                      disabled={respondTask.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRespond(task.id, 'revisao_solicitada')}
                      disabled={respondTask.isPending}
                      className="flex-1"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Solicitar Revisão
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedTask(null)}
                      disabled={respondTask.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {task.resposta_mentorado && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-medium text-primary mb-1">Sua resposta</p>
              <p className="text-sm">{task.resposta_mentorado}</p>
              {task.data_resposta && (
                <p className="text-xs text-muted-foreground mt-2">
                  Respondido em {format(new Date(task.data_resposta), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
              {task.arquivo_resposta_url && (
                <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2">
                  <a href={task.arquivo_resposta_url} target="_blank" rel="noopener noreferrer">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Ver anexo
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-12 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-6" />
        <Skeleton className="h-10 w-full max-w-md mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <CheckSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Tasks de Validação</h1>
          <p className="text-sm text-muted-foreground">
            {pendentes.length} task{pendentes.length !== 1 ? 's' : ''} pendente{pendentes.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="pendentes" className="gap-1">
            <Clock className="h-4 w-4" />
            Pendentes ({pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="em_analise" className="gap-1">
            <AlertCircle className="h-4 w-4" />
            Em Análise ({emAnalise.length})
          </TabsTrigger>
          <TabsTrigger value="concluidas" className="gap-1">
            <CheckCircle className="h-4 w-4" />
            Concluídas ({concluidas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'pendentes' && 'Nenhuma task pendente'}
                  {activeTab === 'em_analise' && 'Nenhuma task em análise'}
                  {activeTab === 'concluidas' && 'Nenhuma task concluída'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map(renderTaskCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
