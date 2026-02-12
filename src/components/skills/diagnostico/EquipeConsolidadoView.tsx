import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Users,
  Layers,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface EquipeConsolidadoViewProps {
  consolidado: {
    dores_comuns?: any;
    processos_maior_potencial?: any;
    sobreposicoes_esforco?: any;
    recomendacoes?: any;
    total_horas_manuais_semana?: number | null;
    potencial_economia_horas?: number | null;
    insights_ia?: string | null;
    gerado_em?: string | null;
  };
}

export default function EquipeConsolidadoView({ consolidado }: EquipeConsolidadoViewProps) {
  const dores = Array.isArray(consolidado.dores_comuns) ? consolidado.dores_comuns : [];
  const processos = Array.isArray(consolidado.processos_maior_potencial) ? consolidado.processos_maior_potencial : [];
  const sobreposicoes = Array.isArray(consolidado.sobreposicoes_esforco) ? consolidado.sobreposicoes_esforco : [];
  const recomendacoes = Array.isArray(consolidado.recomendacoes) ? consolidado.recomendacoes : [];

  return (
    <div className="space-y-6">
      {/* Banner IA */}
      <Card className="border-[hsl(72,50%,35%)] bg-[hsl(68,40%,88%)]">
        <CardContent className="flex items-center gap-3 py-3">
          <Sparkles className="h-5 w-5 text-[hsl(72,50%,35%)]" />
          <p className="text-sm text-foreground">
            Diagnóstico consolidado da equipe — gerado em{" "}
            {consolidado.gerado_em
              ? new Date(consolidado.gerado_em).toLocaleDateString("pt-BR")
              : "data não disponível"}
          </p>
        </CardContent>
      </Card>

      {/* Economia Total */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-[hsl(72,50%,35%)]" />
            Economia da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total horas manuais/semana</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {consolidado.total_horas_manuais_semana ?? 0}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Potencial de economia</p>
              <p className="mt-1 text-xl font-bold text-[hsl(72,50%,35%)]">
                {consolidado.potencial_economia_horas ?? 0}h
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dores Comuns */}
      {dores.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Dores Comuns da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dores.map((dor: any, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(72,50%,35%)]" />
                  {typeof dor === "string" ? dor : (
                    <div>
                      <span className="font-medium">{dor.dor || dor.descricao || dor.nome}</span>
                      {dor.impacto && <p className="text-xs text-muted-foreground mt-0.5">{dor.impacto}</p>}
                      {dor.membros_afetados && (
                        <span className="text-xs text-muted-foreground">{dor.membros_afetados} membro(s) afetado(s)</span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Processos com Maior Potencial */}
      {processos.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Processos com Maior Potencial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processos.map((proc: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {idx + 1}. {typeof proc === "string" ? proc : proc.nome || proc.processo || ""}
                  </p>
                  {proc.impacto && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Impacto: {proc.impacto}
                    </p>
                  )}
                </div>
                {proc.prioridade && (
                  <Badge
                    variant={proc.prioridade === "Alta" ? "default" : "secondary"}
                    className={proc.prioridade === "Alta" ? "bg-[hsl(72,50%,35%)] text-white hover:bg-[hsl(72,50%,30%)]" : ""}
                  >
                    {proc.prioridade}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sobreposições de Esforço */}
      {sobreposicoes.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Sobreposições de Esforço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sobreposicoes.map((item: any, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Users className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  {typeof item === "string" ? item : item.descricao || item.nome || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {recomendacoes.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside">
              {recomendacoes.map((rec: any, i: number) => (
                <li key={i} className="text-sm text-foreground">
                  {typeof rec === "string" ? rec : rec.descricao || rec.recomendacao || JSON.stringify(rec)}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Insights IA */}
      {consolidado.insights_ia && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Insights da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {consolidado.insights_ia}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
