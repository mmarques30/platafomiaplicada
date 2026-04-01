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
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        {etapas?.map((etapa, i) => {
          const stats = getEtapaStats(etapa.id);
          const isConcluida = etapa.status === 'concluida';
          const isAtual = etapa.status === 'em_andamento';

          return (
            <div key={etapa.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Marcador circular */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  isConcluida
                    ? "bg-emerald-500/20 text-emerald-500"
                    : isAtual
                    ? "bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/40 animate-pulse"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isConcluida ? '✓' : i + 1}
              </div>

              {/* Card da etapa */}
              <Card
                className="flex-1 cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
                onClick={() => navigate(`/mentoria/etapa/${etapa.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {etapa.titulo}
                    </h3>
                    {isAtual && (
                      <span className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold whitespace-nowrap">
                        você está aqui
                      </span>
                    )}
                  </div>

                  {etapa.objetivo && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {etapa.objetivo}
                    </p>
                  )}

                  {isAtual && stats.totalInstrucoes > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span>{stats.progressoInstrucoes}%</span>
                      </div>
                      <Progress value={stats.progressoInstrucoes} className="h-1.5" />
                    </div>
                  )}

                  {isConcluida && etapa.data_prevista && (
                    <p className="text-xs text-muted-foreground">
                      Concluída em {format(new Date(etapa.data_prevista), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-medium">{stats.totalEntregas}</span> entregas
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <span className="font-medium">{stats.instrucoesConcluidas}/{stats.totalInstrucoes}</span> instruções
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
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
