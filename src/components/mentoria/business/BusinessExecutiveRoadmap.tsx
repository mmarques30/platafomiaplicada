import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight
} from "lucide-react";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BusinessExecutiveRoadmap() {
  const { contrato, reports, isLoading } = useContratosBusiness();
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const { user } = useAuth();
  const { data: tasks } = useTasksByUser(user?.id);
  const navigate = useNavigate();

  const tasksPendentes = tasks?.filter(t => 
    t.status === 'pendente' || t.status === 'revisao_solicitada'
  ).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // Flag para modo preview (sem contrato ativo)
  const isPreview = !contrato;

  // Dados de exemplo para o modo preview
  const entregasExemplo = [
    { id: null, titulo: "Diagnóstico Inicial", tipo: "Análise", status: "pendente", prazo: null },
    { id: null, titulo: "Desenvolvimento de Solução", tipo: "Implementação", status: "pendente", prazo: null },
    { id: null, titulo: "Treinamento da Equipe", tipo: "Capacitação", status: "pendente", prazo: null },
    { id: null, titulo: "Go-Live e Acompanhamento", tipo: "Entrega", status: "pendente", prazo: null },
  ];

  // Mapear etapas reais para o formato do timeline
  const entregasFromEtapas = etapas?.map(etapa => ({
    id: etapa.id,
    titulo: etapa.titulo,
    tipo: `Etapa ${etapa.numero_etapa}`,
    prazo: etapa.data_prevista,
    status: etapa.status || 'pendente',
  })) || [];

  const entregas = isPreview ? entregasExemplo : entregasFromEtapas;
  const entregasConcluidas = isPreview ? 0 : entregas.filter(e => e.status === "concluida").length;
  const progressoAtual = isPreview ? 0 : (entregas.length > 0 ? Math.round((entregasConcluidas / entregas.length) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* Banner de Preview */}
      {isPreview && (
        <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4 inline mr-2" />
              Pré-visualização do Roadmap — Os dados serão preenchidos após a configuração do seu contrato
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progresso Geral do Roadmap */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Progresso do Roadmap</span>
          <span className="text-muted-foreground">
            {entregasConcluidas}/{entregas.length} etapas ({progressoAtual}%)
          </span>
        </div>
        <Progress value={progressoAtual} className="h-2" />
      </div>

      {/* Timeline de Entregas (Etapas) */}
      <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Etapas do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
            
            <div className={`space-y-4 ${isPreview ? 'opacity-60' : ''}`}>
              {entregas.map((entrega, index) => {
                const isConcluida = entrega.status === "concluida";
                const isEmAndamento = entrega.status === "em_andamento";
                
                return (
                  <div 
                    key={entrega.id || index} 
                    className={`relative pl-8 ${!isPreview && entrega.id ? 'cursor-pointer group' : ''}`}
                    onClick={() => {
                      if (!isPreview && entrega.id) {
                        navigate(`/mentoria/etapa/${entrega.id}`);
                      }
                    }}
                  >
                    {/* Status dot - bullet simples */}
                    <div className="absolute left-0 top-3">
                      <div className={`h-4 w-4 rounded-full border-2 border-background ${
                        isConcluida 
                          ? 'bg-emerald-500' 
                          : isEmAndamento 
                            ? 'bg-amber-500' 
                            : 'bg-zinc-900 dark:bg-zinc-100'
                      }`} />
                    </div>
                    
                    <div className={`p-3 rounded-lg transition-colors ${
                      isConcluida 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : isEmAndamento 
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : isPreview
                            ? 'bg-muted/30 border border-dashed border-border'
                            : 'bg-muted/50 group-hover:bg-muted/70'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isConcluida ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                          {entrega.titulo}
                        </span>
                        <div className="flex items-center gap-2">
                          {entrega.tipo && (
                            <Badge variant="outline" className="text-xs">
                              {entrega.tipo}
                            </Badge>
                          )}
                          {entrega.prazo && (
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(entrega.prazo), "dd MMM", { locale: ptBR })}
                            </span>
                          )}
                          {!isPreview && entrega.id && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Tasks - Horizontal Full Width */}
      <Card className={`border-border/50 bg-card/50 ${isPreview ? 'border-dashed' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Tasks
              {!isPreview && tasksPendentes > 0 && (
                <Badge variant="destructive" className="text-xs">{tasksPendentes}</Badge>
              )}
            </CardTitle>
            {!isPreview && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/mentoria/validacoes')}
              >
                Ver Tasks
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isPreview ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Suas tasks aparecerão aqui
            </p>
          ) : tasksPendentes === 0 ? (
            <div className="flex items-center justify-center py-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-muted-foreground">Nenhuma task pendente</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks?.filter(t => t.status === 'pendente' || t.status === 'revisao_solicitada').slice(0, 3).map((task) => (
                <div 
                  key={task.id}
                  className="p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <p className="text-sm font-medium truncate">{task.titulo}</p>
                  {task.prazo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Prazo: {format(new Date(task.prazo), "dd/MM", { locale: ptBR })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
