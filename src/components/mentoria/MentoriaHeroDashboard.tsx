import { useAuth } from "@/hooks/useAuth";
import { useFasesProcesso } from "@/hooks/useFasesProcesso";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { Target, ListTodo, Calendar, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { differenceInDays } from "date-fns";
import { useCountUp } from "@/hooks/useCountUp";

export function MentoriaHeroDashboard() {
  const { user } = useAuth();
  const { fases } = useFasesProcesso(user?.id);
  const { tarefas } = useMentoriaTarefas();
  const { sessoes } = useMentoriaSessoes();

  // Métricas
  const faseAtual = fases.find((f) => f.status === "em_andamento");
  const fasesConcluidas = fases.filter((f) => f.status === "concluida").length;
  const progressoGeral = fases.length > 0 ? Math.round((fasesConcluidas / fases.length) * 100) : 0;

  const tarefasPendentes = tarefas.filter(
    (t) => t.status === "pendente" || t.status === "em_andamento" || t.status === "atrasada"
  ).length;

  const proximaSessao = sessoes
    .filter((s) => s.status === "agendada" && new Date(s.data_sessao) > new Date())
    .sort((a, b) => new Date(a.data_sessao).getTime() - new Date(b.data_sessao).getTime())[0];

  const diasParaSessao = proximaSessao
    ? differenceInDays(new Date(proximaSessao.data_sessao), new Date())
    : null;

  const firstName = user?.user_metadata?.nome_completo?.split(" ")[0] || "Mentorado";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-primary/5 rounded-xl border-2 border-primary/30 shadow-lg shadow-primary/10 p-4 sm:p-6 mb-6">
      {/* Logo 3D transparente como background centralizado */}
      <img
        src="/logo-3d.png?v=10"
        alt=""
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-auto opacity-[0.08] pointer-events-none select-none"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Gradient overlay para profundidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Olá, {firstName}!
        </h1>
        <p className="text-sm text-muted-foreground">
          {faseAtual
            ? `Você está na ${faseAtual.nome_fase}`
            : "Bem-vindo ao seu painel de mentoria personalizado"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {/* Fase Atual */}
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Fase Atual</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {faseAtual?.fase_numero || "-"}
            </span>
            <span className="text-xs text-muted-foreground">de {fases.length || "-"}</span>
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Progresso</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">{progressoGeral}</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>

        {/* Tarefas Pendentes */}
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <ListTodo className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Tarefas</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">{tarefasPendentes}</span>
            <span className="text-xs text-muted-foreground">pendentes</span>
          </div>
        </div>

        {/* Próxima Sessão */}
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Próx. Sessão</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {diasParaSessao !== null ? diasParaSessao : "-"}
            </span>
            <span className="text-xs text-muted-foreground">
              {diasParaSessao !== null ? "dias" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar do Roadmap */}
      <div className="relative z-10 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Progresso do Roadmap</span>
          <span className="text-foreground font-medium">
            {fasesConcluidas} de {fases.length} fases completas
          </span>
        </div>
        <Progress value={progressoGeral} className="h-2 bg-primary/20 [&>div]:bg-primary" />
      </div>
    </div>
  );
}
