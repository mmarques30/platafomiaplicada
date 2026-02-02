import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDiagnosticosEquipe, useDiagnosticoConsolidado } from "@/hooks/admin/useConteudosSkillsAdmin";
import { AlertCircle, Check, Clock, Brain, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DiagnosticosSkillsTabProps {
  equipeId: string | null;
}

export default function DiagnosticosSkillsTab({ equipeId }: DiagnosticosSkillsTabProps) {
  const { data: diagnosticos, isLoading: diagLoading } = useDiagnosticosEquipe(equipeId);
  const { data: consolidado, isLoading: consLoading } = useDiagnosticoConsolidado(equipeId);

  if (!equipeId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecione uma equipe</h3>
          <p className="text-muted-foreground text-center">
            Escolha uma equipe na aba "Equipes" para ver os diagnósticos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (diagLoading || consLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnóstico Consolidado */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Diagnóstico Consolidado</CardTitle>
          </div>
          <CardDescription>
            Visão geral gerada pela IA com base nos diagnósticos individuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {consolidado ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Horas Manuais/Semana</p>
                  <p className="text-2xl font-bold">
                    {consolidado.total_horas_manuais_semana || 0}h
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">Potencial de Economia</p>
                  <p className="text-2xl font-bold text-green-600">
                    {consolidado.potencial_economia_horas || 0}h
                  </p>
                </div>
              </div>

              {consolidado.insights_ia && (
                <div className="p-4 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Insights da IA</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {consolidado.insights_ia}
                  </p>
                </div>
              )}

              {consolidado.dores_comuns && Array.isArray(consolidado.dores_comuns) && (
                <div>
                  <p className="text-sm font-medium mb-2">Dores Comuns</p>
                  <div className="flex flex-wrap gap-2">
                    {(consolidado.dores_comuns as string[]).map((dor, i) => (
                      <Badge key={i} variant="secondary">{dor}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Diagnóstico consolidado ainda não gerado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnósticos Individuais */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnósticos Individuais</CardTitle>
          <CardDescription>
            Status dos diagnósticos de cada membro da equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {diagnosticos && diagnosticos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosticos.map((diag) => (
                  <TableRow key={diag.id}>
                    <TableCell className="font-medium">{diag.nome_usuario}</TableCell>
                    <TableCell>{diag.cargo || "-"}</TableCell>
                    <TableCell>{diag.area_atuacao || "-"}</TableCell>
                    <TableCell>
                      {diag.completado ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" /> Completo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" /> Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(diag.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum diagnóstico encontrado para esta equipe</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
