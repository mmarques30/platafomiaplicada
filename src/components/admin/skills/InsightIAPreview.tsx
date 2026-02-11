import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, DollarSign, Lightbulb, BookOpen, TrendingUp, Zap, Target } from "lucide-react";

interface InsightIAPreviewProps {
  insightIA: any;
  economiaHoras?: number | null;
  economiaValor?: number | null;
}

export default function InsightIAPreview({ insightIA, economiaHoras, economiaValor }: InsightIAPreviewProps) {
  if (!insightIA) return null;

  const data = typeof insightIA === "string" ? (() => { try { return JSON.parse(insightIA); } catch { return null; } })() : insightIA;

  if (!data || typeof data !== "object") {
    return (
      <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
        <p className="text-xs font-medium text-primary mb-1">Insight IA</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(insightIA)}</p>
      </div>
    );
  }

  const perfil = data.perfil || data.profile || {};
  const processos = data.processos || data.processes || [];
  const economia = data.economia || data.economics || {};
  const insights = data.insights || data.analysis || {};
  const trilha = data.trilha || data.trail || data.trilha_sugerida || [];

  const horasEconomia = economiaHoras || economia.horas_semana || economia.horas_por_semana || economia.hours_per_week;
  const valorEconomia = economiaValor || economia.valor_mensal || economia.monthly_value;

  return (
    <div className="space-y-3">
      {/* Perfil */}
      {Object.keys(perfil).length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase">Perfil Identificado</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {perfil.cargo && <Badge variant="outline" className="text-xs">{perfil.cargo}</Badge>}
            {perfil.area && <Badge variant="outline" className="text-xs">{perfil.area}</Badge>}
            {perfil.nivel_tecnico && <Badge variant="outline" className="text-xs">Nível: {perfil.nivel_tecnico}</Badge>}
            {perfil.disponibilidade && <Badge variant="outline" className="text-xs">{perfil.disponibilidade}</Badge>}
            {perfil.maturidade_digital && <Badge variant="outline" className="text-xs">Maturidade: {perfil.maturidade_digital}</Badge>}
          </div>
        </div>
      )}

      {/* Economia */}
      {(horasEconomia || valorEconomia) && (
        <div className="grid grid-cols-2 gap-3">
          {horasEconomia && (
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Clock className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Economia estimada</p>
                <p className="text-lg font-bold">{horasEconomia}h/sem</p>
              </div>
            </div>
          )}
          {valorEconomia && (
            <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg"><DollarSign className="h-4 w-4 text-green-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Valor mensal</p>
                <p className="text-lg font-bold">R$ {Number(valorEconomia).toLocaleString("pt-BR")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processos */}
      {Array.isArray(processos) && processos.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase">Processos Analisados</p>
          </div>
          <div className="space-y-2">
            {processos.map((proc: any, i: number) => (
              <div key={i} className="p-2 bg-background/50 rounded-md border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{proc.nome || proc.name || proc.processo || `Processo ${i + 1}`}</p>
                  <div className="flex gap-1.5">
                    {proc.frequencia && <Badge variant="outline" className="text-[10px] px-1.5">{proc.frequencia}</Badge>}
                    {proc.impacto && <Badge className={`text-[10px] px-1.5 ${proc.impacto === "alto" || proc.impacto === "high" ? "bg-red-500/10 text-red-600 border-red-500/20" : proc.impacto === "medio" || proc.impacto === "medium" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : "bg-green-500/10 text-green-600 border-green-500/20"}`}>{proc.impacto}</Badge>}
                  </div>
                </div>
                {proc.tempo && <p className="text-xs text-muted-foreground mb-1">⏱ {proc.tempo}</p>}
                {(proc.potencial_automacao != null || proc.automation_potential != null) && (
                  <div className="flex items-center gap-2">
                    <Progress value={Number(proc.potencial_automacao || proc.automation_potential)} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">{proc.potencial_automacao || proc.automation_potential}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights / Análise */}
      {(insights.analise || insights.analysis || insights.oportunidades || insights.opportunities || insights.primeiros_passos || insights.first_steps) && (
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium text-primary uppercase">Análise & Oportunidades</p>
          </div>
          {(insights.analise || insights.analysis) && (
            <p className="text-sm text-muted-foreground mb-2">{insights.analise || insights.analysis}</p>
          )}
          {Array.isArray(insights.oportunidades || insights.opportunities) && (
            <div className="mb-2">
              <p className="text-xs font-medium mb-1">Oportunidades:</p>
              <ul className="space-y-0.5">
                {(insights.oportunidades || insights.opportunities).map((op: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <TrendingUp className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    {op}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(insights.primeiros_passos || insights.first_steps) && (
            <div>
              <p className="text-xs font-medium mb-1">Primeiros passos:</p>
              <ul className="space-y-0.5">
                {(insights.primeiros_passos || insights.first_steps).map((step: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Target className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Trilha sugerida */}
      {Array.isArray(trilha) && trilha.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground uppercase">Trilha Sugerida</p>
          </div>
          <div className="space-y-1.5">
            {trilha.map((mod: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-background/50 rounded-md border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{mod.nome || mod.name || mod.modulo || mod.titulo}</p>
                  {(mod.descricao || mod.description) && (
                    <p className="text-xs text-muted-foreground truncate">{mod.descricao || mod.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {mod.prioridade && (
                    <Badge className={`text-[10px] px-1.5 ${mod.prioridade === "alta" || mod.prioridade === "high" ? "bg-red-500/10 text-red-600 border-red-500/20" : mod.prioridade === "media" || mod.prioridade === "medium" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : "bg-green-500/10 text-green-600 border-green-500/20"}`}>
                      {mod.prioridade}
                    </Badge>
                  )}
                  {(mod.tempo_estimado || mod.estimated_time) && (
                    <span className="text-[10px] text-muted-foreground">{mod.tempo_estimado || mod.estimated_time}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
