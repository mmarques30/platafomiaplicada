import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDiagnosticoConsolidado } from "@/hooks/admin/useConteudosSkillsAdmin";
import { AlertCircle, Brain, Clock, TrendingUp, Loader2, Lightbulb, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalisesIASkillsTabProps {
  equipeId: string | null;
}

export default function AnalisesIASkillsTab({ equipeId }: AnalisesIASkillsTabProps) {
  const { data: consolidado, isLoading } = useDiagnosticoConsolidado(equipeId);

  if (!equipeId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecione uma equipe</h3>
          <p className="text-muted-foreground text-center">
            Escolha uma equipe na aba "Equipes" para ver as análises.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!consolidado) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Análise não disponível</h3>
          <p className="text-muted-foreground text-center max-w-md">
            A análise de IA será gerada após os membros da equipe completarem seus diagnósticos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Manuais/Semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {consolidado.total_horas_manuais_semana || 0}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total identificado na equipe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Potencial de Economia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {consolidado.potencial_economia_horas || 0}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Por semana com automação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Versão da Análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">v{consolidado.versao || 1}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {consolidado.gerado_em
                ? format(new Date(consolidado.gerado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights da IA */}
      {consolidado.insights_ia && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle>Insights da IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {consolidado.insights_ia}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Processos com Maior Potencial */}
      {consolidado.processos_maior_potencial && Array.isArray(consolidado.processos_maior_potencial) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Processos com Maior Potencial</CardTitle>
            </div>
            <CardDescription>
              Áreas identificadas com maior oportunidade de automação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(consolidado.processos_maior_potencial as any[]).map((processo, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">
                    {typeof processo === "string" ? processo : processo.nome || processo.titulo}
                  </span>
                  {typeof processo === "object" && processo.horas && (
                    <Badge variant="outline">{processo.horas}h/sem</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dores Comuns */}
      {consolidado.dores_comuns && Array.isArray(consolidado.dores_comuns) && consolidado.dores_comuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dores Comuns Identificadas</CardTitle>
            <CardDescription>
              Problemas recorrentes mencionados pelos membros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(consolidado.dores_comuns as string[]).map((dor, i) => (
                <Badge key={i} variant="secondary" className="py-1.5 px-3">
                  {dor}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {consolidado.recomendacoes && Array.isArray(consolidado.recomendacoes) && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
            <CardDescription>
              Sugestões de próximos passos baseadas na análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(consolidado.recomendacoes as string[]).map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary font-medium">{i + 1}.</span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
