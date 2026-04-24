import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText,
  ExternalLink,
  Send,
  RotateCcw
} from 'lucide-react';
import { useTasksByUser, useRespondTask, TaskBusiness } from '@/hooks/useTasksBusiness';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInDays, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_LABELS: Record<string, string> = {
  validacao: 'Validação',
  aprovacao: 'Aprovação',
  revisao: 'Revisão',
  homologacao: 'Homologação',
  assinatura: 'Assinatura',
  feedback: 'Feedback',
};

const PRIORIDADE_CONFIG: Record<string, { label: string; className: string }> = {
  baixa: { label: 'Baixa', className: 'bg-gray-100 text-gray-700' },
  media: { label: 'Média', className: 'bg-blue-100 text-blue-700' },
  alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
};

const PendenciasValidacao: React.FC = () => {
  const { user } = useAuth();
  const { data: tasks, isLoading } = useTasksByUser(user?.id);
  const respondTask = useRespondTask();

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const pendentes = tasks?.filter(t => t.status === 'pendente' || t.status === 'revisao_solicitada') || [];
  const emAnalise = tasks?.filter(t => t.status === 'em_analise') || [];
  const concluidas = tasks?.filter(t => t.status === 'aprovado' || t.status === 'rejeitado') || [];

  const handleRespond = async (taskId: string, status: 'aprovado' | 'rejeitado' | 'em_analise') => {
    await respondTask.mutateAsync({
      taskId,
      resposta: responses[taskId] || '',
      status: status === 'em_analise' ? 'aprovado' : status,
    });
    setResponses(prev => ({ ...prev, [taskId]: '' }));
    setExpandedTask(null);
  };

  const getPrazoInfo = (prazo: string | null) => {
    if (!prazo) return null;
    const prazoDate = new Date(prazo);
    const hoje = new Date();
    const diasRestantes = differenceInDays(prazoDate, hoje);
    const atrasado = isPast(prazoDate);

    if (atrasado) {
      return { text: `Atrasado (${format(prazoDate, "dd/MM", { locale: ptBR })})`, className: 'text-red-600' };
    } else if (diasRestantes <= 2) {
      return { text: `Em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`, className: 'text-orange-600' };
    } else {
      return { text: format(prazoDate, "dd/MM/yyyy", { locale: ptBR }), className: 'text-muted-foreground' };
    }
  };

  const renderTaskCard = (task: TaskBusiness, showActions = true) => {
    const prioridadeConfig = PRIORIDADE_CONFIG[task.prioridade] ?? PRIORIDADE_CONFIG.media;
    const prazoInfo = getPrazoInfo(task.prazo);
    const isExpanded = expandedTask === task.id;
    const isRevisao = task.status === 'revisao_solicitada';

    return (
      <Card key={task.id} className={`mb-4 ${isRevisao ? 'border-orange-300 bg-orange-50/50' : ''}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isRevisao ? (
                    <RotateCcw className="h-4 w-4 text-orange-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <h4 className="font-medium">{task.titulo}</h4>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {task.tipo && (
                    <Badge variant="outline">{TIPO_LABELS[task.tipo] || task.tipo}</Badge>
                  )}
                  <Badge className={prioridadeConfig.className}>{prioridadeConfig.label}</Badge>
                  {prazoInfo && (
                    <span className={`text-sm flex items-center gap-1 ${prazoInfo.className}`}>
                      <Clock className="h-3 w-3" />
                      {prazoInfo.text}
                    </span>
                  )}
                  {isRevisao && (
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Revisão Solicitada
                    </Badge>
                  )}
                </div>

                {task.descricao && (
                  <p className="text-sm text-muted-foreground mb-3">{task.descricao}</p>
                )}
              </div>
            </div>

            {task.instrucoes_validacao && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-2">Instruções:</p>
                <p className="text-sm whitespace-pre-line">{task.instrucoes_validacao}</p>
              </div>
            )}

            <div className="flex gap-2">
              {task.documento_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={task.documento_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-1" />
                    Ver Documento
                  </a>
                </Button>
              )}
              {task.link_referencia && (
                <Button variant="outline" size="sm" asChild>
                  <a href={task.link_referencia} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Link de Referência
                  </a>
                </Button>
              )}
            </div>

            {showActions && (
              <>
                {isExpanded ? (
                  <div className="space-y-3 pt-3 border-t">
                    <Textarea
                      placeholder="Adicione sua resposta, observações ou feedback..."
                      value={responses[task.id] || ''}
                      onChange={(e) => setResponses(prev => ({ ...prev, [task.id]: e.target.value }))}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleRespond(task.id, 'aprovado')}
                        disabled={respondTask.isPending}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleRespond(task.id, 'em_analise')}
                        disabled={respondTask.isPending}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar para Análise
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleRespond(task.id, 'rejeitado')}
                        disabled={respondTask.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setExpandedTask(null)}
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => setExpandedTask(task.id)}
                  >
                    Responder
                  </Button>
                )}
              </>
            )}

            {!showActions && task.resposta_mentorado && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-medium mb-1">Sua resposta:</p>
                <p className="text-sm">{task.resposta_mentorado}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando pendências...
        </CardContent>
      </Card>
    );
  }

  if (pendentes.length === 0 && emAnalise.length === 0 && concluidas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <p className="font-medium">Nenhuma pendência de validação</p>
          <p className="text-sm">Você está em dia!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pendentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Pendências de Validação
              <Badge variant="destructive">{pendentes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendentes.map(task => renderTaskCard(task, true))}
          </CardContent>
        </Card>
      )}

      {emAnalise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              Aguardando Aprovação
              <Badge variant="secondary">{emAnalise.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emAnalise.map(task => renderTaskCard(task, false))}
          </CardContent>
        </Card>
      )}

      {concluidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Concluídas
              <Badge variant="outline">{concluidas.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {concluidas.map(task => renderTaskCard(task, false))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PendenciasValidacao;
