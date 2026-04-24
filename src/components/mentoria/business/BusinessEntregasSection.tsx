import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Package, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Upload,
  BookOpen,
  Layers
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { EntregaBusiness } from "@/hooks/useEntregasBusiness";

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  status: string;
  prazo_entrega?: string;
  arquivo_entrega_url?: string;
  entrega_id?: string;
}

interface BusinessEntregasSectionProps {
  entregas: EntregaBusiness[];
  tarefas: Tarefa[];
  onUpdateTarefa?: (id: string, data: any) => void;
  onUploadEntrega?: (tarefaId: string, file: File) => void;
  isUpdating?: boolean;
  showBacklog?: boolean;
}

export function BusinessEntregasSection({ 
  entregas, 
  tarefas,
  onUpdateTarefa,
  onUploadEntrega,
  isUpdating,
  showBacklog = true
}: BusinessEntregasSectionProps) {
  const navigate = useNavigate();
  const [openEntregas, setOpenEntregas] = useState<string[]>([entregas[0]?.id].filter(Boolean));

  const entregasAtivas = entregas.filter(e => e.tipo === 'ativa');
  const entregasBacklog = entregas.filter(e => e.tipo === 'backlog' || e.tipo === 'futura');

  const toggleEntrega = (entregaId: string) => {
    setOpenEntregas(prev => 
      prev.includes(entregaId) 
        ? prev.filter(id => id !== entregaId)
        : [...prev, entregaId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'em_andamento': { label: 'Em andamento', className: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
      'concluida': { label: 'Concluída', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
      'pendente': { label: 'Pendente', className: 'bg-muted text-muted-foreground border-border' },
      'cancelada': { label: 'Cancelada', className: 'bg-red-500/10 text-red-700 border-red-500/30' },
    };
    const config = statusMap[status] || statusMap['pendente'];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeMap: Record<string, { label: string; className: string }> = {
      'urgente': { label: 'Urgente', className: 'bg-red-500/10 text-red-700 border-red-500/30' },
      'critica': { label: 'Urgente', className: 'bg-red-500/10 text-red-700 border-red-500/30' },
      'alta': { label: 'Alta', className: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
      'media': { label: 'Média', className: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
      'baixa': { label: 'Baixa', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
    };
    const config = prioridadeMap[prioridade] || prioridadeMap['media'];
    return <Badge variant="outline" className={`text-xs ${config.className}`}>{config.label}</Badge>;
  };

  const getTarefasByEntrega = (entregaId: string) => {
    return tarefas.filter(t => t.entrega_id === entregaId);
  };

  const calcularProgresso = (entregaId: string) => {
    const tarefasEntrega = getTarefasByEntrega(entregaId);
    if (tarefasEntrega.length === 0) return 0;
    const concluidas = tarefasEntrega.filter(t => t.status === 'concluida').length;
    return Math.round((concluidas / tarefasEntrega.length) * 100);
  };

  const renderEntrega = (entrega: EntregaBusiness) => {
    const entregaTarefas = getTarefasByEntrega(entrega.id);
    const isOpen = openEntregas.includes(entrega.id);
    const progresso = calcularProgresso(entrega.id);
    
    return (
      <Collapsible 
        key={entrega.id} 
        open={isOpen}
        onOpenChange={() => toggleEntrega(entrega.id)}
      >
        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{entrega.titulo}</h4>
                    {entrega.tem_instrucoes && (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Co-criação
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {entrega.modulo_relacionado && (
                      <span className="text-xs text-muted-foreground">
                        Módulo: {entrega.modulo_relacionado}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {entregaTarefas.filter(t => t.status === 'concluida').length}/{entregaTarefas.length} tarefas
                    </span>
                    {entrega.prazo_previsto && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entrega.prazo_previsto), "dd/MM", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  {entregaTarefas.length > 0 && (
                    <Progress value={progresso} className="h-1.5 mt-2" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPrioridadeBadge(entrega.prioridade)}
                {getStatusBadge(entrega.status)}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="border-t border-border p-4 space-y-3">
              {entrega.descricao && (
                <p className="text-sm text-muted-foreground mb-4">{entrega.descricao}</p>
              )}
              
              {entrega.tem_instrucoes && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/mentoria/entrega/${entrega.id}`)}
                  className="mb-4"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver Instruções de Execução
                </Button>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Tarefas para Validação
                </span>
              </div>
              
              {entregaTarefas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tarefa cadastrada
                </p>
              ) : (
                <div className="space-y-2">
                  {entregaTarefas.slice(0, 5).map((tarefa) => (
                    <div 
                      key={tarefa.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onUpdateTarefa?.(tarefa.id, { 
                            status: tarefa.status === 'concluida' ? 'pendente' : 'concluida' 
                          })}
                          className="hover:scale-110 transition-transform"
                          disabled={isUpdating}
                        >
                          {getStatusIcon(tarefa.status)}
                        </button>
                        <div>
                          <span className={`text-sm ${tarefa.status === 'concluida' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {tarefa.titulo}
                          </span>
                          {tarefa.prazo_entrega && (
                            <p className="text-xs text-muted-foreground">
                              Prazo: {format(new Date(tarefa.prazo_entrega), "dd/MM", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {tarefa.arquivo_entrega_url ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs">
                          Entregue
                        </Badge>
                      ) : onUploadEntrega && (
                        <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onUploadEntrega(tarefa.id, file);
                            }}
                          />
                          <Upload className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </label>
                      )}
                    </div>
                  ))}
                  {entregaTarefas.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{entregaTarefas.length - 5} tarefas
                    </p>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5 text-primary" />
            Entregas do Projeto
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entregas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma entrega cadastrada ainda.</p>
            <p className="text-sm mt-1">As entregas serão geradas a partir dos documentos do projeto.</p>
          </div>
        ) : (
          <>
            {/* Entregas Ativas */}
            {entregasAtivas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Entregas Ativas ({entregasAtivas.length})
                </h3>
                {entregasAtivas.map(renderEntrega)}
              </div>
            )}
            
            {/* Backlog */}
            {showBacklog && entregasBacklog.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Backlog / Entregas Futuras ({entregasBacklog.length})
                </h3>
                <div className="space-y-2">
                  {entregasBacklog.map((entrega) => (
                    <div 
                      key={entrega.id}
                      className="p-3 rounded-lg border border-dashed border-border bg-muted/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{entrega.titulo}</h4>
                          {entrega.justificativa_backlog && (
                            <p className="text-xs text-muted-foreground mt-1">
                              "{entrega.justificativa_backlog}"
                            </p>
                          )}
                        </div>
                        {getPrioridadeBadge(entrega.prioridade)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
