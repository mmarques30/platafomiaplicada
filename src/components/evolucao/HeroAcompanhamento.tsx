import { Card } from "@/components/ui/card";
import { Brain, FolderKanban, CheckCircle2, AlertCircle } from "lucide-react";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useMentoriaProjetos } from "@/hooks/useMentoriaProjetos";

export function HeroAcompanhamento() {
  const { formulario } = useMentoriaForm();
  const { projetos } = useMentoriaProjetos();

  const diagnosticoCompleto = formulario?.completado || false;
  const totalProjetos = projetos?.length || 0;
  const projetosAtivos = projetos?.filter(p => p.status === 'em_andamento').length || 0;
  const projetosConcluidos = projetos?.filter(p => p.status === 'concluido').length || 0;

  return (
    <Card className="border-aplicada-green-900/20 bg-aplicada-dark overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Meu <span className="text-primary">Acompanhamento</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Diagnóstico IA e projetos para aplicar seus conhecimentos
            </p>
          </div>
        </div>

        {/* Mini Cards de Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-aplicada-green-900/30 bg-zinc-800/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs text-zinc-400">Diagnóstico</span>
            </div>
            <div className="flex items-center gap-2">
              {diagnosticoCompleto ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="text-base font-semibold text-white">Completo</p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <p className="text-base font-semibold text-white">Pendente</p>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-aplicada-green-900/30 bg-zinc-800/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <FolderKanban className="h-4 w-4 text-primary" />
              <span className="text-xs text-zinc-400">Projetos Ativos</span>
            </div>
            <p className="text-xl font-semibold text-white">{projetosAtivos}</p>
            <p className="text-xs text-zinc-500">em andamento</p>
          </div>

          <div className="rounded-lg border border-aplicada-green-900/30 bg-zinc-800/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-xs text-zinc-400">Concluídos</span>
            </div>
            <p className="text-xl font-semibold text-white">{projetosConcluidos}</p>
            <p className="text-xs text-zinc-500">finalizados</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
