import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2, Clock } from "lucide-react";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness, useInstrucoesByContrato } from "@/hooks/useEtapasBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTitle } from "@/components/shared/PageTitle";

const statusConfig = {
  pendente: { label: "Pendente", className: "bg-muted text-muted-foreground" },
  em_andamento: { label: "Em Andamento", className: "bg-amber-500/20 text-amber-600" },
  concluida: { label: "Concluída", className: "bg-emerald-500/20 text-emerald-600" },
};

export default function MentoriaEtapasBusiness() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: loadingContrato } = useContratosBusiness(businessUserId);
  const { data: etapas, isLoading: loadingEtapas } = useEtapasBusiness(contrato?.id);
  const { entregas } = useEntregasBusiness(contrato?.id);
  const { data: instrucoes } = useInstrucoesByContrato(contrato?.id);

  const isLoading = loadingContrato || loadingEtapas;

  // Calcular progresso geral
  const totalEtapas = etapas?.length || 0;
  const etapasConcluidas = etapas?.filter(e => e.status === 'concluida').length || 0;
  const progressoGeral = totalEtapas > 0 ? Math.round((etapasConcluidas / totalEtapas) * 100) : 0;

  // Contar entregas e instruções por etapa
  const getEtapaStats = (etapaId: string) => {
    const entregasEtapa = entregas.filter(e => e.etapa_id === etapaId);
    const instrucoesEtapa = instrucoes?.filter(i => i.etapa_id === etapaId) || [];
    const instrucoesConcluidas = instrucoesEtapa.filter(i => i.status === 'concluida').length;
    const progressoInstrucoes = instrucoesEtapa.length > 0 
      ? Math.round((instrucoesConcluidas / instrucoesEtapa.length) * 100) 
      : 0;
    
    return {
      totalEntregas: entregasEtapa.length,
      totalInstrucoes: instrucoesEtapa.length,
      instrucoesConcluidas,
      progressoInstrucoes,
    };
  };

  if (isLoading) {
    return <PageSkeleton variant="evolucao" />;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/mentoria")}
        className="text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="mb-8">
        <PageTitle primary="Minhas" secondary="Fases" />
        <p className="text-muted-foreground text-lg mt-2">
          Acompanhe o progresso das fases do seu projeto
        </p>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <span>Progresso Geral</span>
            <span className="text-sm font-normal text-muted-foreground">
              {etapasConcluidas}/{totalEtapas} fases concluídas
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressoGeral} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {progressoGeral}% concluído
          </p>
        </CardContent>
      </Card>

      {/* Lista de Etapas */}
      <div className="space-y-4">
        {etapas?.map((etapa) => {
          const stats = getEtapaStats(etapa.id);
          const statusInfo = statusConfig[etapa.status];
          
          return (
            <Card 
              key={etapa.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
                etapa.status === 'concluida' && "opacity-75"
              )}
              onClick={() => navigate(`/mentoria/etapa/${etapa.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                        etapa.status === 'concluida' 
                          ? "bg-emerald-500/20 text-emerald-600" 
                          : etapa.status === 'em_andamento'
                          ? "bg-amber-500/20 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {etapa.status === 'concluida' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          etapa.numero_etapa
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Fase {etapa.numero_etapa}: {etapa.titulo}
                        </h3>
                        {etapa.data_prevista && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Previsão: {format(new Date(etapa.data_prevista), "dd MMM yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {etapa.objetivo && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 pl-11">
                        {etapa.objetivo}
                      </p>
                    )}

                    <div className="flex items-center gap-4 pl-11">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">{stats.totalEntregas}</span> entregas
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">{stats.instrucoesConcluidas}/{stats.totalInstrucoes}</span> instruções
                      </div>
                      {stats.totalInstrucoes > 0 && (
                        <div className="flex-1 max-w-32">
                          <Progress value={stats.progressoInstrucoes} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!etapas || etapas.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Nenhuma fase cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
