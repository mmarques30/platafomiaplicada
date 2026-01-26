import { useParams, useNavigate } from "react-router-dom";
import { useEtapaById, useInstrucoesEtapa, useUpdateInstrucao } from "@/hooks/useEtapasBusiness";
import { useEntregasByEtapa } from "@/hooks/useEntregasBusiness";
import { EtapaHeader } from "@/components/mentoria/business/EtapaHeader";
import { InstrucaoCard } from "@/components/mentoria/business/InstrucaoCard";
import { MarcosEtapa } from "@/components/mentoria/business/MarcosEtapa";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Users, Target, Package, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function MentoriaEtapa() {
  const { etapaId } = useParams<{ etapaId: string }>();
  const navigate = useNavigate();
  const { data: etapa, isLoading: loadingEtapa } = useEtapaById(etapaId);
  const { data: instrucoes, isLoading: loadingInstrucoes } = useInstrucoesEtapa(etapaId);
  const { data: entregas, isLoading: loadingEntregas } = useEntregasByEtapa(etapaId);
  const updateInstrucao = useUpdateInstrucao();

  const handleToggleStatus = (id: string, novoStatus: 'pendente' | 'concluida') => {
    if (!etapaId) return;
    updateInstrucao.mutate({ id, etapaId, status: novoStatus });
  };

  // Agrupar instruções por entrega
  const instrucoesAgrupadas = useMemo(() => {
    if (!instrucoes || !entregas) return { porEntrega: [], avulsas: [] };

    const entregaMap = new Map(entregas.map(e => [e.id, e]));
    const porEntrega: {
      entrega: typeof entregas[0];
      instrucoesVoce: typeof instrucoes;
      instrucoesConjunto: typeof instrucoes;
      progresso: number;
    }[] = [];
    const instrucoesAvulsas: typeof instrucoes = [];

    // Agrupar por entrega_id
    const grupos = new Map<string | null, typeof instrucoes>();
    instrucoes.forEach(instr => {
      const entregaId = (instr as any).entrega_id || null;
      if (!grupos.has(entregaId)) {
        grupos.set(entregaId, []);
      }
      grupos.get(entregaId)!.push(instr);
    });

    // Processar grupos
    grupos.forEach((instrs, entregaId) => {
      if (entregaId && entregaMap.has(entregaId)) {
        const entrega = entregaMap.get(entregaId)!;
        const instrucoesVoce = instrs.filter(i => i.responsavel === 'voce');
        const instrucoesConjunto = instrs.filter(i => i.responsavel === 'conjunto');
        const concluidas = instrs.filter(i => i.status === 'concluida').length;
        const progresso = instrs.length > 0 ? Math.round((concluidas / instrs.length) * 100) : 0;
        
        porEntrega.push({ entrega, instrucoesVoce, instrucoesConjunto, progresso });
      } else {
        instrucoesAvulsas.push(...instrs);
      }
    });

    // Ordenar por numero_entrega
    porEntrega.sort((a, b) => (a.entrega.numero_entrega || 0) - (b.entrega.numero_entrega || 0));

    return { porEntrega, avulsas: instrucoesAvulsas };
  }, [instrucoes, entregas]);

  const instrucoesVoceAvulsas = instrucoesAgrupadas.avulsas.filter(i => i.responsavel === 'voce');
  const instrucoesConjuntoAvulsas = instrucoesAgrupadas.avulsas.filter(i => i.responsavel === 'conjunto');

  const calcularProgresso = (lista: typeof instrucoes) => {
    if (!lista || lista.length === 0) return 0;
    const concluidas = lista.filter(i => i.status === 'concluida').length;
    return Math.round((concluidas / lista.length) * 100);
  };

  const progressoGeral = calcularProgresso(instrucoes);

  if (loadingEtapa || loadingInstrucoes || loadingEntregas) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!etapa) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-muted-foreground">Etapa não encontrada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/mentoria/etapas-business")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <EtapaHeader etapa={etapa} />
        </div>
      </div>

      {/* Objetivo da Etapa */}
      {etapa.objetivo && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Objetivo desta Fase</p>
                <p className="text-sm text-muted-foreground mt-1">{etapa.objetivo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso Geral */}
      {instrucoes && instrucoes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Progresso da Fase</span>
              <span className="text-sm font-normal text-muted-foreground">
                {instrucoes.filter(i => i.status === 'concluida').length}/{instrucoes.length} instruções
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressoGeral} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Instruções agrupadas por Entrega */}
      {instrucoesAgrupadas.porEntrega.map(({ entrega, instrucoesVoce, instrucoesConjunto, progresso }) => (
        <Card key={entrega.id}>
          <CardHeader className="pb-3">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => navigate(`/mentoria/entrega/${entrega.id}`)}
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                    {entrega.numero_entrega ? `Entrega ${entrega.numero_entrega}: ` : ''}
                    {entrega.titulo}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {instrucoesVoce.length + instrucoesConjunto.length} instruções • {progresso}% concluído
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20">
                  <Progress value={progresso} className="h-1.5" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Suas Instruções */}
            {instrucoesVoce.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Suas Instruções</span>
                  <span className="text-muted-foreground">
                    ({calcularProgresso(instrucoesVoce)}%)
                  </span>
                </div>
                <div className="pl-6 space-y-2">
                  {instrucoesVoce.map(instrucao => (
                    <InstrucaoCard
                      key={instrucao.id}
                      instrucao={instrucao}
                      onToggleStatus={handleToggleStatus}
                      isUpdating={updateInstrucao.isPending}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Na Próxima Reunião */}
            {instrucoesConjunto.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Na Próxima Reunião</span>
                  <span className="text-muted-foreground">
                    ({calcularProgresso(instrucoesConjunto)}%)
                  </span>
                </div>
                <div className="pl-6 space-y-2">
                  {instrucoesConjunto.map(instrucao => (
                    <InstrucaoCard
                      key={instrucao.id}
                      instrucao={instrucao}
                      onToggleStatus={handleToggleStatus}
                      isUpdating={updateInstrucao.isPending}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Instruções avulsas (sem entrega vinculada) */}
      {instrucoesVoceAvulsas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Instruções Gerais
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {calcularProgresso(instrucoesVoceAvulsas)}% concluído
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instrucoesVoceAvulsas.map(instrucao => (
              <InstrucaoCard
                key={instrucao.id}
                instrucao={instrucao}
                onToggleStatus={handleToggleStatus}
                isUpdating={updateInstrucao.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {instrucoesConjuntoAvulsas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                Na Próxima Reunião
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {calcularProgresso(instrucoesConjuntoAvulsas)}% concluído
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instrucoesConjuntoAvulsas.map(instrucao => (
              <InstrucaoCard
                key={instrucao.id}
                instrucao={instrucao}
                onToggleStatus={handleToggleStatus}
                isUpdating={updateInstrucao.isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <MarcosEtapa marcos={etapa.marcos_proxima_etapa} />

      {(!instrucoes || instrucoes.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma instrução cadastrada para esta fase.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
