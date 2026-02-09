import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDiagnosticosEquipeAdmin, MembroDiagnostico } from "@/hooks/admin/useDiagnosticosEquipeAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronDown, ChevronUp, Sparkles, CheckCircle, Clock, Brain, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import DiagnosticoRespostasView from "./DiagnosticoRespostasView";

interface Props { equipeId: string }

export default function DiagnosticosSkillsTab({ equipeId }: Props) {
  const { data: membros = [], isLoading } = useDiagnosticosEquipeAdmin(equipeId);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
                        {/* Respostas brutas */}
                        {membro.dadosBrutos && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="text-xs font-medium text-muted-foreground uppercase">Respostas do Diagnóstico</p>
                            </div>
                            <DiagnosticoRespostasView dados={membro.dadosBrutos} />
                          </div>
                        )}

                        {/* Botão processar */}
                        {membro.completado && !membro.hasInsight && (
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">Diagnóstico preenchido, mas não processado por IA</p>
                            <Button size="sm" onClick={() => handleProcessar(membro)} disabled={processingId === membro.userId}>
                              {processingId === membro.userId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                              Processar com IA
                            </Button>
                          </div>
                        )}

                        {/* Resultados IA */}
                        {membro.economia_horas_semana && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Economia estimada</p>
                              <p className="text-lg font-bold">{membro.economia_horas_semana}h/sem</p>
                            </div>
                            {membro.economia_valor_mensal && (
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground">Valor mensal</p>
                                <p className="text-lg font-bold">R$ {membro.economia_valor_mensal?.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {membro.insight_ia && (
                          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                            <p className="text-xs font-medium text-primary mb-1">Insight IA</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {typeof membro.insight_ia === 'string' ? membro.insight_ia : JSON.stringify(membro.insight_ia, null, 2)}
                            </p>
                          </div>
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
