import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Target,
  BookOpen,
  TrendingUp,
  Users,
  BarChart3,
  Award,
  RefreshCw,
} from "lucide-react";
import type { DiagnosticoSkills } from "@/hooks/useSkillsDiagnostico";
import { useSkillsEquipe } from "@/hooks/useSkillsEquipe";

import EquipeConsolidadoView from "./EquipeConsolidadoView";

interface DiagnosticoResultsProps {
  onRefill?: () => void;
  diagnostico?: DiagnosticoSkills;
}

export default function DiagnosticoResults({ onRefill, diagnostico }: DiagnosticoResultsProps) {
  const insight = diagnostico?.insight_ia;
  const hasRealData = !!insight;
  const { consolidado, isLoading: equipeLoading } = useSkillsEquipe();
  

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

  return (
    <Tabs defaultValue="minha-analise" className="w-full">
      <TabsList className="skills-tabs-list mb-4">
        <TabsTrigger value="minha-analise" className="skills-tabs-trigger">Minha Análise</TabsTrigger>
      </TabsList>

      <TabsContent value="minha-analise">
        <MinhaAnaliseContent diagnostico={diagnostico} onRefill={onRefill} insight={insight} />
      </TabsContent>

      <TabsContent value="equipe">
        {equipeLoading ? (
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Carregando dados da equipe...</p>
            </CardContent>
          </Card>
        ) : consolidado ? (
          <EquipeConsolidadoView consolidado={consolidado} />
        ) : (
          <Card className="border-[hsl(68,35%,73%)] bg-[hsl(68,40%,88%)]">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Users className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold text-foreground">Aguardando consolidação</p>
                <p className="text-sm text-muted-foreground mt-1">
                  O diagnóstico consolidado da equipe ainda não foi gerado pelo administrador.
                </p>
              </div>
              <div className="text-left max-w-md">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Quando disponível, você terá acesso a:
                </p>
                <ul className="space-y-2">
                  {["Dores comuns da equipe", "Processos com maior potencial", "Recomendações consolidadas", "Economia total estimada"].map((item) => (
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
      </TabsContent>
    </Tabs>
  );
}

/* ── Conteúdo individual extraído ── */

function MinhaAnaliseContent({
  diagnostico,
  onRefill,
  insight,
}: {
  diagnostico?: DiagnosticoSkills;
  onRefill?: () => void;
  insight: any;
}) {
  const perfil = insight.perfil || {};
  const processos = insight.processos || [];
  const economia = insight.economia || {};
  const trilha = insight.trilha || {};
  const insights = insight.insights || {};

  return (
    <div className="space-y-6">

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
