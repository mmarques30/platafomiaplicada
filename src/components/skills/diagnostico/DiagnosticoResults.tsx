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

const MOCK_PROFILE = {
  cargo: "Analista Financeiro",
  area: "Financeiro",
  nivelTecnico: "Intermediário",
  disponibilidade: "4-6h/semana",
};

const MOCK_PROCESSOS = [
  { nome: "Consolidação de dados financeiros", frequencia: "Diária", tempo: "2h/vez", impacto: "Alto", potencialAutomacao: 80 },
  { nome: "Relatórios gerenciais semanais", frequencia: "Semanal", tempo: "4h/vez", impacto: "Alto", potencialAutomacao: 70 },
  { nome: "Conciliação bancária", frequencia: "Semanal", tempo: "1h/vez", impacto: "Médio", potencialAutomacao: 60 },
];

const MOCK_ECONOMIA = {
  horasSemana: 12,
  economiaEstimada: "10-12h/sem",
  valorMensal: 2880,
};

const MOCK_TRILHA = {
  modulos: [
    { nome: "Fundamentos de IA para Negócios", descricao: "Conceitos básicos de IA aplicada", prioridade: "Alta" },
    { nome: "Automação com ChatGPT", descricao: "Usar IA generativa no dia a dia", prioridade: "Alta" },
    { nome: "Excel + IA", descricao: "Potencializar planilhas com IA", prioridade: "Média" },
  ],
  tempoEstimado: "24 horas de estudo",
  prioridades: ["Automação de relatórios", "Análise de dados", "Prompts avançados"],
};

const MOCK_INSIGHTS = {
  analise: "Seu perfil indica forte potencial para automação de processos financeiros repetitivos. Com nível técnico intermediário, você pode implementar soluções de IA rapidamente.",
  oportunidades: ["Automatizar consolidação de dados", "Criar dashboards inteligentes", "Automatizar follow-ups"],
  primeirosPassos: ["Começar com automação de relatórios", "Aprender prompts para análise de dados", "Implementar templates inteligentes"],
};

const MOCK_EQUIPE = {
  total: 4,
  completed: 2,
  pending: ["Colaborador C", "Colaborador D"],
};

interface DiagnosticoResultsProps {
  onRefill?: () => void;
  diagnostico?: DiagnosticoSkills;
}

export default function DiagnosticoResults({ onRefill, diagnostico }: DiagnosticoResultsProps) {
  const insight = diagnostico?.insight_ia;
  const hasRealData = !!insight;

  // Dados do perfil
  const perfil = hasRealData
    ? insight.perfil
    : MOCK_PROFILE;

  // Processos
  const processos = hasRealData
    ? (insight.processos || [])
    : MOCK_PROCESSOS;

  // Economia
  const economia = hasRealData
    ? insight.economia
    : MOCK_ECONOMIA;

  // Trilha
  const trilha = hasRealData
    ? insight.trilha
    : MOCK_TRILHA;

  // Insights
  const insights = hasRealData
    ? insight.insights
    : MOCK_INSIGHTS;

  return (
    <div className="space-y-6">
      {/* Banner IA */}
      {hasRealData && (
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
      )}

      {/* Perfil Mapeado */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-[hsl(72,50%,35%)]" />
            Seu Perfil Mapeado
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Diagnóstico individual concluído
          </p>
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
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-[hsl(72,50%,35%)]" />
            Seus Processos Identificados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {processos.map((proc: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {idx + 1}. {proc.nome}
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Frequência: {proc.frequencia || proc.freq}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Tempo: {proc.tempo}
                  </span>
                  {proc.potencialAutomacao != null && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Automação: {proc.potencialAutomacao}%
                    </span>
                  )}
                </div>
              </div>
              <Badge
                variant={proc.impacto === "Alto" ? "default" : "secondary"}
                className={
                  proc.impacto === "Alto"
                    ? "bg-[hsl(72,50%,35%)] text-white hover:bg-[hsl(72,50%,30%)]"
                    : ""
                }
              >
                {proc.impacto}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

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
              <p className="mt-1 text-xl font-bold text-foreground">
                {economia.horasSemana || 0}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Economia estimada</p>
              <p className="mt-1 text-xl font-bold text-[hsl(72,50%,35%)]">
                {economia.economiaEstimada || `${economia.horasSemana}h/sem`}
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
      {insights && (
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
            {trilha.modulos?.length || 0} módulos selecionados para você
          </p>

          {trilha.modulos?.length > 0 && (
            <div className="space-y-2">
              {trilha.modulos.map((mod: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{mod.nome}</p>
                    <p className="text-xs text-muted-foreground">{mod.descricao}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {mod.prioridade}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Tempo estimado: {trilha.tempoEstimado}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[hsl(72,50%,35%)] text-[hsl(72,50%,35%)] hover:bg-[hsl(68,40%,88%)]"
            >
              <BookOpen className="h-4 w-4" />
              Ver Minha Trilha
            </Button>
            {onRefill && (
              <Button variant="outline" onClick={onRefill}>
                <RefreshCw className="h-4 w-4" />
                Refazer Diagnóstico
              </Button>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-[hsl(68,40%,88%)] p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(72,50%,35%)]" />
            <p className="text-xs text-foreground">
              Entregas serão definidas quando toda equipe preencher o diagnóstico
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Banner Aguardando Equipe */}
      <Card className="border-[hsl(68,35%,73%)] bg-[hsl(68,40%,88%)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Users className="h-5 w-5 text-[hsl(72,50%,35%)]" />
            Aguardando Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">
            Diagnóstico preenchido: {MOCK_EQUIPE.completed} de {MOCK_EQUIPE.total} membros
          </p>
          <Progress
            value={(MOCK_EQUIPE.completed / MOCK_EQUIPE.total) * 100}
            className="h-2"
            indicatorClassName="bg-[hsl(72,50%,35%)]"
          />
          <p className="text-sm text-muted-foreground">
            Faltam: {MOCK_EQUIPE.pending.join(", ")}
          </p>
          <Separator />
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Quando todos preencherem, você terá acesso a:
            </p>
            <ul className="space-y-2">
              {[
                "Entregas priorizadas da equipe",
                "Projetos colaborativos",
                "Visão consolidada de impacto",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(72,50%,35%)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
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
