import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/admin/StatsCard";
import { AlertCard } from "@/components/admin/AlertCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban,
  CheckSquare,
  Calendar,
  AlertTriangle,
  HelpCircle,
  FileText,
  Target,
} from "lucide-react";

interface MentoriaTabProps {
  data: {
    alertas: {
      tarefasAtrasadas: number;
      duvidasPendentes: number;
      diagnosticosIncompletos: number;
    };
    mentoria: {
      projetosEmAndamento: number;
      tarefasPorStatus: {
        pendente: number;
        em_andamento: number;
        concluida: number;
      };
      sessoesAgendadas: number;
    };
  };
}

export function MentoriaTab({ data }: MentoriaTabProps) {
  const navigate = useNavigate();

  const totalTarefas = 
    data.mentoria.tarefasPorStatus.pendente + 
    data.mentoria.tarefasPorStatus.em_andamento + 
    data.mentoria.tarefasPorStatus.concluida;

  const taxaConclusao = totalTarefas > 0 
    ? Math.round((data.mentoria.tarefasPorStatus.concluida / totalTarefas) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Alertas */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Requer Atenção</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <AlertCard
            title="Tarefas Atrasadas"
            value={data.alertas.tarefasAtrasadas}
            icon={AlertTriangle}
            severity="error"
            onClick={() => navigate("/admin/projetos/minhas-tarefas")}
          />
          <AlertCard
            title="Dúvidas Pendentes"
            value={data.alertas.duvidasPendentes}
            icon={HelpCircle}
            severity="warning"
            onClick={() => navigate("/admin/gestao/duvidas")}
          />
          <AlertCard
            title="Diagnósticos Incompletos"
            value={data.alertas.diagnosticosIncompletos}
            icon={FileText}
            severity="warning"
            onClick={() => navigate("/admin/gestao/formularios")}
          />
        </div>
      </div>

      {/* Métricas Gerais */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Visão Geral</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Projetos em Andamento"
            value={data.mentoria.projetosEmAndamento}
            description="Planejamento + Em andamento"
            icon={FolderKanban}
          />
          <StatsCard
            title="Tarefas Pendentes"
            value={data.mentoria.tarefasPorStatus.pendente}
            description={`${data.mentoria.tarefasPorStatus.em_andamento} em andamento`}
            icon={CheckSquare}
          />
          <StatsCard
            title="Tarefas Concluídas"
            value={data.mentoria.tarefasPorStatus.concluida}
            description="Total concluído"
            icon={CheckSquare}
          />
          <StatsCard
            title="Sessões Agendadas"
            value={data.mentoria.sessoesAgendadas}
            description="Próximas sessões"
            icon={Calendar}
          />
        </div>
      </div>

      {/* Status das Tarefas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Taxa de Conclusão de Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{taxaConclusao}%</span>
              <p className="text-sm text-muted-foreground mt-1">
                {data.mentoria.tarefasPorStatus.concluida} de {totalTarefas} tarefas
              </p>
            </div>
            <Progress value={taxaConclusao} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Pendentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{data.mentoria.tarefasPorStatus.pendente}</span>
                  <span className="text-xs text-muted-foreground">
                    ({totalTarefas > 0 ? Math.round((data.mentoria.tarefasPorStatus.pendente / totalTarefas) * 100) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Em Andamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{data.mentoria.tarefasPorStatus.em_andamento}</span>
                  <span className="text-xs text-muted-foreground">
                    ({totalTarefas > 0 ? Math.round((data.mentoria.tarefasPorStatus.em_andamento / totalTarefas) * 100) : 0}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Concluídas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{data.mentoria.tarefasPorStatus.concluida}</span>
                  <span className="text-xs text-muted-foreground">
                    ({totalTarefas > 0 ? Math.round((data.mentoria.tarefasPorStatus.concluida / totalTarefas) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Tarefas</span>
                <span className="font-bold">{totalTarefas}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
