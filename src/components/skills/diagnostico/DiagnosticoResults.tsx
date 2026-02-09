import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  TrendingUp,
  Users,
  AlertCircle,
  BarChart3,
  Award,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { DiagnosticoSkills } from "@/hooks/useSkillsDiagnostico";
import { useSkillsEquipeDiagnostico } from "@/hooks/useSkillsEquipeDiagnostico";

interface DiagnosticoResultsProps {
  onRefill?: () => void;
  diagnostico?: DiagnosticoSkills;
}

export default function DiagnosticoResults({ onRefill, diagnostico }: DiagnosticoResultsProps) {
  const insight = diagnostico?.insight_ia;
  const hasRealData = !!insight;
  const equipe = useSkillsEquipeDiagnostico();

  if (!hasRealData) {
    return (
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold text-foreground">Nenhum resultado disponível</p>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha o diagnóstico para ver sua análise personalizada por IA.
              </p>
            </div>
            {onRefill && (
              <Button
                onClick={onRefill}
                className="bg-[hsl(72,50%,35%)] text-white hover:bg-[hsl(72,50%,30%)]"
              >
                Preencher Diagnóstico
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const perfil = insight.perfil || {};
  const processos = insight.processos || [];
  const economia = insight.economia || {};
  const trilha = insight.trilha || {};
  const insights = insight.insights || {};

  return (
    <div className="space-y-6">
      {/* Banner IA */}
      <Card className="border-[hsl(72,50%,35%)] bg-[hsl(68,40%,88%)]">
        <CardContent className="flex items-center gap-3 py-3">
          <Sparkles className="h-5 w-5 text-[hsl(72,50%,35%)]" />
          <p className="text-sm text-foreground">
            Análise gerada por IA em{" "}
            {diagnostico?.insight_gerado_em
              ? new Date(diagnostico.insight_gerado_em).toLocaleDateString("pt-BR")
              : "data não disponível"}
          </p>
        </CardContent>
      </Card>

      {/* Perfil Mapeado */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-[hsl(72,50%,35%)]" />
            Seu Perfil Mapeado
          </CardTitle>
          <p className="text-sm text-muted-foreground">Diagnóstico individual concluído</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ProfileItem label="Cargo" value={perfil.cargo || "—"} />
            <ProfileItem label="Área" value={perfil.area || "—"} />
            <ProfileItem label="Nível Técnico" value={perfil.nivelTecnico || "—"} />
            <ProfileItem label="Disponibilidade" value={perfil.disponibilidade || "—"} />
          </div>
        </CardContent>
      </Card>

      {/* Processos Identificados */}
      {processos.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Seus Processos Identificados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {processos.map((proc: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{idx + 1}. {proc.nome}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Frequência: {proc.frequencia || proc.freq}</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />Tempo: {proc.tempo}</span>
                    {proc.potencialAutomacao != null && (
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Automação: {proc.potencialAutomacao}%</span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={proc.impacto === "Alto" ? "default" : "secondary"}
                  className={proc.impacto === "Alto" ? "bg-[hsl(72,50%,35%)] text-white hover:bg-[hsl(72,50%,30%)]" : ""}
                >
                  {proc.impacto}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Economia Potencial */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-[hsl(72,50%,35%)]" />
            Sua Economia Potencial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Horas economizadas/semana</p>
              <p className="mt-1 text-xl font-bold text-foreground">{economia.horasSemana || 0}h</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Economia estimada</p>
              <p className="mt-1 text-xl font-bold text-[hsl(72,50%,35%)]">
                {economia.economiaEstimada || `${economia.horasSemana || 0}h/sem`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Valor potencial mensal</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                R$ {(economia.valorMensal || 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">a R$60/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights da IA */}
      {insights.analise && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Insights Personalizados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground leading-relaxed">{insights.analise}</p>
            {insights.oportunidades?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Oportunidades:</p>
                <ul className="space-y-1">
                  {insights.oportunidades.map((opp: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(72,50%,35%)]" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {insights.primeirosPassos?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Primeiros Passos:</p>
                <ol className="space-y-1 list-decimal list-inside">
                  {insights.primeirosPassos.map((passo: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{passo}</li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trilha Personalizada */}
      {trilha.modulos?.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Sua Trilha Personalizada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">
              <Award className="mr-1 inline h-4 w-4 text-[hsl(72,50%,35%)]" />
              {trilha.modulos.length} módulos selecionados para você
            </p>
            <div className="space-y-2">
              {trilha.modulos.map((mod: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{mod.nome}</p>
                    <p className="text-xs text-muted-foreground">{mod.descricao}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{mod.prioridade}</Badge>
                </div>
              ))}
            </div>
            {trilha.tempoEstimado && (
              <p className="text-sm text-muted-foreground">Tempo estimado: {trilha.tempoEstimado}</p>
            )}
            <div className="flex gap-2">
              {onRefill && (
                <Button variant="outline" onClick={onRefill}>
                  <RefreshCw className="h-4 w-4" />
                  Refazer Diagnóstico
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banner Aguardando Equipe — dados reais */}
      {!equipe.isLoading && equipe.totalMembros > 0 && !equipe.todosPreencheram && (
        <Card className="border-[hsl(68,35%,73%)] bg-[hsl(68,40%,88%)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Users className="h-5 w-5 text-[hsl(72,50%,35%)]" />
              Aguardando Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground">
              Diagnóstico preenchido: {equipe.diagnosticosCompletos} de {equipe.totalMembros} membros
            </p>
            <Progress
              value={(equipe.diagnosticosCompletos / equipe.totalMembros) * 100}
              className="h-2"
              indicatorClassName="bg-[hsl(72,50%,35%)]"
            />
            {equipe.membros.filter(m => !m.completado).length > 0 && (
              <p className="text-sm text-muted-foreground">
                Faltam: {equipe.membros.filter(m => !m.completado).map(m => m.nome).join(", ")}
              </p>
            )}
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Quando todos preencherem, você terá acesso a:
              </p>
              <ul className="space-y-2">
                {["Entregas priorizadas da equipe", "Projetos colaborativos", "Visão consolidada de impacto"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(72,50%,35%)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
