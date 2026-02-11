import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDiagnosticosEquipeAdmin, MembroDiagnostico } from "@/hooks/admin/useDiagnosticosEquipeAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronUp, Sparkles, CheckCircle, Clock, Brain, Users, FileText, BarChart3, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import DiagnosticoRespostasView from "./DiagnosticoRespostasView";
import InsightIAPreview from "./InsightIAPreview";
import ReactMarkdown from "react-markdown";

interface Props { equipeId: string }

export default function DiagnosticosSkillsTab({ equipeId }: Props) {
  const { data: membros = [], isLoading } = useDiagnosticosEquipeAdmin(equipeId);
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const handleProcessar = async (membro: MembroDiagnostico) => {
    if (!membro.diagnosticoId) return;
    setProcessingId(membro.userId);
    try {
      const { error } = await supabase.functions.invoke('processar-diagnostico-skills', {
        body: { diagnostico_id: membro.diagnosticoId, user_id: membro.userId }
      });
      if (error) throw error;
      toast.success(`Diagnóstico de ${membro.nome} processado!`);
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
            <span className="text-sm text-muted-foreground">{completos}/{membros.length} preenchidos · {processados} processados</span>
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
              {/* Insights IA */}
              {consolidado.insights_ia && (
                <div className="p-3 bg-muted/30 rounded-lg prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{consolidado.insights_ia as string}</ReactMarkdown>
                </div>
              )}

              {/* Metrics row */}
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

              {/* Dores Comuns */}
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

              {/* Recomendações */}
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
                    {!membro.completado && !membro.dadosBrutos ? (
                      <p className="text-sm text-muted-foreground">Diagnóstico ainda não preenchido pelo membro.</p>
                    ) : (
                      <div className="space-y-3">
                        {membro.dadosBrutos && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-xs font-medium text-muted-foreground uppercase">Respostas do Diagnóstico</p>
                            </div>
                            <DiagnosticoRespostasView dados={membro.dadosBrutos} />
                          </div>
                        )}
                        {membro.completado && !membro.hasInsight && (
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">Diagnóstico preenchido, mas não processado por IA</p>
                            <Button size="sm" onClick={() => handleProcessar(membro)} disabled={processingId === membro.userId}>
                              {processingId === membro.userId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Processar com IA
                            </Button>
                          </div>
                        )}
                        {(membro.hasInsight || membro.economia_horas_semana) && (
                          <InsightIAPreview
                            insightIA={membro.insight_ia}
                            economiaHoras={membro.economia_horas_semana}
                            economiaValor={membro.economia_valor_mensal}
                          />
                        )}
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
