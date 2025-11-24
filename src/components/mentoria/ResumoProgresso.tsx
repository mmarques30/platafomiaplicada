import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderKanban } from "lucide-react";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { useFasesProcesso } from "@/hooks/useFasesProcesso";
import { ProgressRing } from "./ProgressRing";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

export function ResumoProgresso() {
  const { user } = useAuth();
  const { fases } = useFasesProcesso(user?.id);
  const { sessoes } = useMentoriaSessoes();
  const { projetos } = useMentoriaProjetos();

  // Calcular progresso baseado em fases
  const fasesConcluidas = fases.filter(f => f.status === "concluida").length;
  const progressoFases = fases.length > 0 ? (fasesConcluidas / fases.length) * 100 : 0;
  
  // Calcular tarefas de todas as fases
  const todasTarefas = fases.flatMap(f => f.tarefas || []);
  const tarefasConcluidas = todasTarefas.filter(t => t.status === "concluida").length;
  const progressoTarefas = todasTarefas.length > 0 ? (tarefasConcluidas / todasTarefas.length) * 100 : 0;
  
  // Progresso geral (média ponderada)
  const progressoGeral = fases.length > 0 ? (progressoFases + progressoTarefas) / 2 : 0;
  
  const proximaSessao = sessoes.find(s => s.status === "agendada" && new Date(s.data_sessao) > new Date());
  const projetosEmAndamento = projetos.filter(p => p.status === "em_andamento").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Rings */}
        <div className="grid grid-cols-3 gap-6">
          <ProgressRing
            value={progressoFases}
            label="Fases"
            subtitle={`${fasesConcluidas} de ${fases.length}`}
            color="hsl(var(--primary))"
          />
          <ProgressRing
            value={progressoTarefas}
            label="Tarefas"
            subtitle={`${tarefasConcluidas} de ${todasTarefas.length}`}
            color="hsl(var(--chart-2))"
          />
          <ProgressRing
            value={progressoGeral}
            label="Roadmap"
            subtitle={`${Math.round(progressoGeral)}% completo`}
            color="hsl(var(--chart-3))"
          />
        </div>

        {/* Info adicional */}
        <div className="pt-4 border-t space-y-2">
          {proximaSessao && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Próxima sessão</span>
              </div>
              <span className="font-medium">
                {format(new Date(proximaSessao.data_sessao), "dd/MM 'às' HH'h'", { locale: ptBR })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderKanban className="h-4 w-4" />
              <span>Projetos em andamento</span>
            </div>
            <span className="font-medium">{projetosEmAndamento}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
