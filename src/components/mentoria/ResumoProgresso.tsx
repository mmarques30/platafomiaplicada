import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderKanban } from "lucide-react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { ProgressRing } from "./ProgressRing";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ResumoProgresso() {
  const { formulario } = useMentoriaForm();
  const { tarefas } = useMentoriaTarefas();
  const { sessoes } = useMentoriaSessoes();
  const { projetos } = useMentoriaProjetos();

  const objetivosEstrategicos = projetos.filter(p => p.tipo === "estrategico");
  const objetivosCompletos = objetivosEstrategicos.filter(o => o.status === "concluido").length;
  const progressoObjetivos = objetivosEstrategicos.length > 0 ? (objetivosCompletos / objetivosEstrategicos.length) * 100 : 0;
  
  const tarefasConcluidas = tarefas.filter(t => t.status === "concluida").length;
  const progressoTarefas = tarefas.length > 0 ? (tarefasConcluidas / tarefas.length) * 100 : 0;
  
  const diagnosticoCompleto = formulario?.completado ? 1 : 0;
  const progressoGeral = ((diagnosticoCompleto + (objetivosEstrategicos.length > 0 ? 1 : 0) + (tarefas.length > 0 ? 1 : 0)) / 3) * 100;
  
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
            value={progressoObjetivos}
            label="Objetivos"
            subtitle={`${objetivosCompletos} de ${objetivosEstrategicos.length}`}
            color="hsl(var(--primary))"
          />
          <ProgressRing
            value={progressoTarefas}
            label="Tarefas"
            subtitle={`${tarefasConcluidas} de ${tarefas.length}`}
            color="hsl(var(--chart-2))"
          />
          <ProgressRing
            value={progressoGeral}
            label="Geral"
            subtitle={formulario?.completado ? "Diagnóstico OK" : "Diagnóstico pendente"}
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
