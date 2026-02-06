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
} from "lucide-react";

const MOCK_PROFILE = {
  cargo: "Analista Financeiro",
  area: "Financeiro",
  nivelTecnico: "Intermediário",
  disponibilidade: "4-6h/semana",
};

const MOCK_PROCESSOS = [
  { nome: "Consolidação de dados financeiros", freq: "Diária", tempo: "2h/vez", impacto: "Alto" },
  { nome: "Relatórios gerenciais semanais", freq: "Semanal", tempo: "4h/vez", impacto: "Alto" },
  { nome: "Conciliação bancária", freq: "Semanal", tempo: "1h/vez", impacto: "Médio" },
];

const MOCK_ECONOMIA = {
  tempoAtual: "15h/semana",
  economiaEstimada: "10-12h/sem",
  valorMensal: "R$ 2.880",
  valorHora: "R$60/h",
};

const MOCK_TRILHA = {
  modulos: 8,
  tempoEstimado: "24 horas de estudo",
};

const MOCK_EQUIPE = {
  total: 4,
  completed: 2,
  pending: ["Colaborador C", "Colaborador D"],
};

export default function DiagnosticoResults() {
  return (
    <div className="space-y-6">
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
            <ProfileItem label="Cargo" value={MOCK_PROFILE.cargo} />
            <ProfileItem label="Área" value={MOCK_PROFILE.area} />
            <ProfileItem label="Nível Técnico" value={MOCK_PROFILE.nivelTecnico} />
            <ProfileItem label="Disponibilidade" value={MOCK_PROFILE.disponibilidade} />
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
          {MOCK_PROCESSOS.map((proc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {idx + 1}. {proc.nome}
                </p>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Frequência: {proc.freq}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Tempo: {proc.tempo}
                  </span>
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
              <p className="text-xs text-muted-foreground">Tempo atual em tarefas manuais</p>
              <p className="mt-1 text-xl font-bold text-foreground">{MOCK_ECONOMIA.tempoAtual}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Economia estimada</p>
              <p className="mt-1 text-xl font-bold text-[hsl(72,50%,35%)]">
                {MOCK_ECONOMIA.economiaEstimada}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Valor potencial mensal</p>
              <p className="mt-1 text-xl font-bold text-foreground">{MOCK_ECONOMIA.valorMensal}</p>
              <p className="text-xs text-muted-foreground">a {MOCK_ECONOMIA.valorHora}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {MOCK_TRILHA.modulos} módulos selecionados para você
          </p>
          <p className="text-sm text-muted-foreground">
            Tempo estimado: {MOCK_TRILHA.tempoEstimado}
          </p>
          <Button
            variant="outline"
            className="border-[hsl(72,50%,35%)] text-[hsl(72,50%,35%)] hover:bg-[hsl(68,40%,88%)]"
          >
            <BookOpen className="h-4 w-4" />
            Ver Minha Trilha
          </Button>
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
