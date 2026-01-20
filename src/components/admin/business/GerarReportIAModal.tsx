import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2, FileText, TrendingUp, ListChecks, Video } from "lucide-react";
import { useGerarReportIA, useReportsBusinessMutations, type ReportGeradoIA } from "@/hooks/useReportsBusinessMutations";
import { format } from "date-fns";

interface GerarReportIAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contratoId: string;
  userId: string;
  onSuccess: () => void;
}

export function GerarReportIAModal({ open, onOpenChange, contratoId, userId, onSuccess }: GerarReportIAModalProps) {
  const [periodo, setPeriodo] = useState(format(new Date(), "MMMM/yyyy"));
  const [tipo, setTipo] = useState<'semanal' | 'mensal' | 'trimestral'>('mensal');
  const [reportGerado, setReportGerado] = useState<ReportGeradoIA | null>(null);

  const gerarReport = useGerarReportIA();
  const { createReport } = useReportsBusinessMutations(contratoId);

  const handleGerar = async () => {
    const result = await gerarReport.mutateAsync({
      contrato_id: contratoId,
      user_id: userId,
      periodo,
      tipo,
    });

    setReportGerado(result);
  };

  const handleSalvar = async () => {
    if (!reportGerado) return;

    await createReport.mutateAsync({
      contrato_id: contratoId,
      titulo: reportGerado.titulo,
      descricao: reportGerado.resumo_executivo.slice(0, 500),
      periodo_referencia: reportGerado.periodo_referencia,
      data_envio: new Date().toISOString(),
      tipo,
      conteudo_html: reportGerado.conteudo_html,
      metricas: reportGerado.metricas as unknown as Record<string, unknown>,
      gerado_por_ia: true,
      resumo_executivo: reportGerado.resumo_executivo,
    });

    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setReportGerado(null);
    setPeriodo(format(new Date(), "MMMM/yyyy"));
    setTipo('mensal');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Report via IA
          </DialogTitle>
          <DialogDescription>
            A IA irá analisar o progresso do projeto e gerar um report executivo automaticamente.
          </DialogDescription>
        </DialogHeader>

        {!reportGerado ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Período de Referência</Label>
                <Input
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  placeholder="Ex: Janeiro/2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Report</Label>
                <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">O report incluirá:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Progresso das etapas e entregas
                </li>
                <li className="flex items-center gap-2">
                  <ListChecks className="h-3.5 w-3.5" />
                  Tarefas concluídas
                </li>
                <li className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5" />
                  Vídeos assistidos
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Resumo executivo gerado por IA
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[55vh] pr-4">
            <div className="space-y-4 py-2">
              {/* Métricas */}
              <div className="grid grid-cols-4 gap-3">
                <Card className="border-border/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-primary">{reportGerado.metricas.etapas.percentual}%</p>
                    <p className="text-xs text-muted-foreground">Progresso Etapas</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {reportGerado.metricas.entregas.concluidas}/{reportGerado.metricas.entregas.total}
                    </p>
                    <p className="text-xs text-muted-foreground">Entregas</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-primary">{reportGerado.metricas.tarefas.concluidas}</p>
                    <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-primary">{reportGerado.metricas.videos_assistidos}</p>
                    <p className="text-xs text-muted-foreground">Vídeos Assistidos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Resumo Executivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{reportGerado.resumo_executivo}</p>
                </CardContent>
              </Card>

              {/* Destaques */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Destaques do Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportGerado.destaques.map((destaque, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {destaque}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Próximos Passos */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Próximos Passos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportGerado.proximos_passos.map((passo, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5">{index + 1}</Badge>
                        {passo}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Observações */}
              {reportGerado.observacoes && (
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{reportGerado.observacoes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          
          {!reportGerado ? (
            <Button onClick={handleGerar} disabled={gerarReport.isPending || !periodo}>
              {gerarReport.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Report
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleSalvar} disabled={createReport.isPending}>
              {createReport.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Salvar Report
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
