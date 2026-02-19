import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDiagnosticosEquipeAdmin, MembroDiagnostico, DiagnosticoVersao } from "@/hooks/admin/useDiagnosticosEquipeAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronUp, Sparkles, CheckCircle, Clock, Brain, Users, FileText, BarChart3, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import DiagnosticoRespostasView from "./DiagnosticoRespostasView";
import InsightIAPreview from "./InsightIAPreview";
import ReactMarkdown from "react-markdown";
import SkillsTabActions from "./SkillsTabActions";

interface Props { equipeId: string }

export default function DiagnosticosSkillsTab({ equipeId }: Props) {
  const { data: membros = [], isLoading } = useDiagnosticosEquipeAdmin(equipeId);
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedVersao, setExpandedVersao] = useState<string | null>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);

  // Fetch consolidated diagnostic
  const { data: consolidado, isLoading: isLoadingConsolidado } = useQuery({
    queryKey: ["diagnostico-consolidado", equipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnostico_consolidado_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!equipeId,
  });

  const completos = membros.filter(m => m.completado).length;
  const processados = membros.filter(m => m.hasInsight).length;
  const percentual = membros.length > 0 ? Math.round((completos / membros.length) * 100) : 0;

  const handleProcessarVersao = async (versao: DiagnosticoVersao, membroNome: string) => {
    setProcessingId(versao.id);
    try {
      const { error } = await supabase.functions.invoke('processar-diagnostico-skills', {
        body: { diagnostico_id: versao.id }
      });
      if (error) throw error;
      toast.success(`Diagnóstico v${versao.versao} de ${membroNome} processado!`);
      queryClient.invalidateQueries({ queryKey: ["admin-diagnosticos-equipe", equipeId] });
    } catch (e: any) {
      toast.error("Erro ao processar: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessar = async (membro: MembroDiagnostico) => {
    if (!membro.diagnosticoId) return;
    setProcessingId(membro.userId);
    try {
      const { error } = await supabase.functions.invoke('processar-diagnostico-skills', {
        body: { diagnostico_id: membro.diagnosticoId, user_id: membro.userId }
      });
      if (error) throw error;
      toast.success(`Diagnóstico de ${membro.nome} processado!`);
      queryClient.invalidateQueries({ queryKey: ["admin-diagnosticos-equipe", equipeId] });
    } catch (e: any) {
      toast.error("Erro ao processar: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConsolidar = async () => {
    if (completos === 0) {
      toast.error("Nenhum diagnóstico preenchido para consolidar");
      return;
    }
    setIsConsolidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('consolidar-diagnosticos-skills', {
        body: { equipe_id: equipeId }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Diagnóstico consolidado gerado!");
      queryClient.invalidateQueries({ queryKey: ["diagnostico-consolidado", equipeId] });
    } catch (e: any) {
      toast.error(e.message || "Erro ao consolidar diagnósticos");
    } finally {
      setIsConsolidating(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const handleClearDiagnosticos = async () => {
    const { error: e1 } = await supabase.from("diagnostico_consolidado_skills").delete().eq("equipe_id", equipeId);
    if (e1) throw e1;
    const { error: e2 } = await supabase.from("diagnosticos_skills").delete().eq("equipe_id", equipeId);
    if (e2) throw e2;
    queryClient.invalidateQueries({ queryKey: ["diagnostico-consolidado", equipeId] });
    queryClient.invalidateQueries({ queryKey: ["admin-diagnosticos-equipe", equipeId] });
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card className="border-border/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Progresso da Equipe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{completos}/{membros.length} preenchidos · {processados} processados</span>
              <SkillsTabActions
                onClear={handleClearDiagnosticos}
                hasData={membros.length > 0 || !!consolidado}
                clearDescription="Todos os diagnósticos individuais e o diagnóstico consolidado desta equipe serão removidos."
              />
            </div>
          </div>
          <Progress value={percentual} className="h-2" />
        </CardContent>
      </Card>

      {/* Consolidated Diagnostic Section */}
      <Card className="border-border/50">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Diagnóstico Consolidado</CardTitle>
              {consolidado && <Badge variant="secondary" className="text-xs">v{consolidado.versao || 1}</Badge>}
            </div>
            <Button size="sm" onClick={handleConsolidar} disabled={isConsolidating || completos === 0}>
              {isConsolidating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : consolidado ? <RefreshCw className="h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {consolidado ? "Reconsolidar" : "Consolidar Diagnósticos"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {completos === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-600">Nenhum diagnóstico preenchido. Os membros precisam preencher seus diagnósticos para gerar a consolidação.</p>
            </div>
          ) : !consolidado ? (
            <p className="text-sm text-muted-foreground">Clique em "Consolidar Diagnósticos" para gerar a visão unificada da equipe com IA.</p>
          ) : (
            <div className="space-y-4">
              {consolidado.insights_ia && (
                <div className="p-3 bg-muted/30 rounded-lg prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{consolidado.insights_ia as string}</ReactMarkdown>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {consolidado.total_horas_manuais_semana && (
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{consolidado.total_horas_manuais_semana}h</p>
                    <p className="text-xs text-muted-foreground">Horas manuais/semana</p>
                  </div>
                )}
                {consolidado.potencial_economia_horas && (
                  <div className="p-3 bg-primary/10 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{consolidado.potencial_economia_horas}h</p>
                    <p className="text-xs text-muted-foreground">Potencial economia/semana</p>
                  </div>
                )}
              </div>
              {Array.isArray(consolidado.dores_comuns) && (consolidado.dores_comuns as any[]).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Dores Comuns</p>
                  <div className="space-y-1.5">
                    {(consolidado.dores_comuns as any[]).map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                        <span>{d.dor}</span>
                        <Badge variant="outline" className="text-xs">{d.membros_afetados} membros</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(consolidado.recomendacoes) && (consolidado.recomendacoes as any[]).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Recomendações</p>
                  <div className="space-y-1.5">
                    {(consolidado.recomendacoes as any[]).map((r: any, i: number) => (
                      <div key={i} className="p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{r.titulo}</span>
                          {r.tipo && <Badge variant="secondary" className="text-xs">{r.tipo}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.descricao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {consolidado.gerado_em && (
                <p className="text-xs text-muted-foreground text-right">Gerado em: {new Date(consolidado.gerado_em as string).toLocaleDateString("pt-BR")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      {membros.length === 0 ? (
        <Card className="border-border/50"><CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Nenhum membro na equipe</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {membros.map(membro => (
            <Collapsible key={membro.userId} open={expandedId === membro.userId} onOpenChange={() => setExpandedId(expandedId === membro.userId ? null : membro.userId)}>
              <Card className="border-border/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={membro.avatar || ""} />
                          <AvatarFallback className="text-xs">{membro.nome?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{membro.nome}</p>
                          {membro.cargo && <p className="text-xs text-muted-foreground">{membro.cargo}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {membro.versoes.length > 1 && (
                          <Badge variant="outline" className="text-xs">{membro.versoes.length} versões</Badge>
                        )}
                        {membro.hasInsight ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1"><Brain className="h-3 w-3" /> Processado</Badge>
                        ) : membro.completado ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs gap-1"><CheckCircle className="h-3 w-3" /> Preenchido</Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>
                        )}
                        {expandedId === membro.userId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-3">
                    {membro.versoes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Diagnóstico ainda não preenchido pelo membro.</p>
                    ) : membro.versoes.length === 1 ? (
                      /* Versão única - layout original */
                      <VersaoContent
                        versao={membro.versoes[0]}
                        membroNome={membro.nome}
                        processingId={processingId}
                        onProcessar={() => handleProcessarVersao(membro.versoes[0], membro.nome)}
                      />
                    ) : (
                      /* Múltiplas versões */
                      <div className="space-y-2">
                        {membro.versoes.map(versao => {
                          const versaoKey = `${membro.userId}-v${versao.versao}`;
                          const isExpanded = expandedVersao === versaoKey;
                          return (
                            <Collapsible key={versaoKey} open={isExpanded} onOpenChange={() => setExpandedVersao(isExpanded ? null : versaoKey)}>
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">v{versao.versao}</Badge>
                                    {versao.hasInsight ? (
                                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1"><Brain className="h-3 w-3" /> Processado</Badge>
                                    ) : versao.completado ? (
                                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs gap-1"><CheckCircle className="h-3 w-3" /> Preenchido</Badge>
                                    ) : (
                                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>
                                    )}
                                  </div>
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 pl-2">
                                  <VersaoContent
                                    versao={versao}
                                    membroNome={membro.nome}
                                    processingId={processingId}
                                    onProcessar={() => handleProcessarVersao(versao, membro.nome)}
                                  />
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

function VersaoContent({
  versao,
  membroNome,
  processingId,
  onProcessar,
}: {
  versao: DiagnosticoVersao;
  membroNome: string;
  processingId: string | null;
  onProcessar: () => void;
}) {
  return (
    <div className="space-y-3">
      {versao.dadosBrutos && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase">Respostas do Diagnóstico</p>
          </div>
          <DiagnosticoRespostasView dados={versao.dadosBrutos} />
        </div>
      )}
      {versao.completado && !versao.hasInsight && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">Diagnóstico preenchido, mas não processado por IA</p>
          <Button size="sm" onClick={onProcessar} disabled={processingId === versao.id}>
            {processingId === versao.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Processar com IA
          </Button>
        </div>
      )}
      {(versao.hasInsight || versao.economia_horas_semana) && (
        <InsightIAPreview
          insightIA={versao.insight_ia}
          economiaHoras={versao.economia_horas_semana}
          economiaValor={versao.economia_valor_mensal}
        />
      )}
    </div>
  );
}
