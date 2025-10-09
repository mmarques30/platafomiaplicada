import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Target, ListTodo, Calendar, FolderKanban } from "lucide-react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useMentoriaObjetivos } from "@/hooks/useMentoriaObjetivos";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ResumoProgresso() {
  const { formulario } = useMentoriaForm();
  const { objetivos } = useMentoriaObjetivos();
  const { tarefas } = useMentoriaTarefas();
  const { sessoes } = useMentoriaSessoes();
  const { projetos } = useMentoriaProjetos();

  const objetivosAtivos = objetivos.filter(o => o.status === "em_andamento").length;
  const tarefasPendentes = tarefas.filter(t => t.status === "pendente").length;
  const tarefasAtrasadas = tarefas.filter(t => t.status === "atrasada").length;
  const proximaSessao = sessoes.find(s => s.status === "agendada" && new Date(s.data_sessao) > new Date());
  const projetosEmAndamento = projetos.filter(p => p.status === "em_andamento").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Resumo do Seu Progresso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">Diagnóstico</span>
          </div>
          <span className={`text-sm font-medium ${formulario?.completado ? "text-green-600" : "text-yellow-600"}`}>
            {formulario?.completado ? "Completo" : "Pendente"}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Objetivos</span>
          </div>
          <span className="text-sm font-medium">
            {objetivos.length} total ({objetivosAtivos} em andamento)
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-purple-600" />
            <span className="text-sm">Tarefas</span>
          </div>
          <span className="text-sm font-medium">
            {tarefasPendentes} pendentes
            {tarefasAtrasadas > 0 && (
              <span className="text-red-600 ml-1">({tarefasAtrasadas} atrasadas!)</span>
            )}
          </span>
        </div>

        {proximaSessao && (
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span className="text-sm">Próxima sessão</span>
            </div>
            <span className="text-sm font-medium">
              {format(new Date(proximaSessao.data_sessao), "dd/MM 'às' HH'h'", { locale: ptBR })}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-orange-600" />
            <span className="text-sm">Projetos</span>
          </div>
          <span className="text-sm font-medium">
            {projetosEmAndamento} em andamento
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
