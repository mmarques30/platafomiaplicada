import { Card } from "@/components/ui/card";
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
          <div className={`rounded-lg border p-3 ${
            diagnosticoCompleto 
              ? "border-primary/30 bg-zinc-700" 
              : "border-orange-500/30 bg-orange-500/10"
          }`}>
            <span className="text-xs text-zinc-300 uppercase tracking-wide block mb-2">Diagnóstico</span>
            <p className={`text-xl font-semibold ${
              diagnosticoCompleto ? "text-primary" : "text-orange-400"
            }`}>
              {diagnosticoCompleto ? "Completo" : "Pendente"}
            </p>
            <p className="text-xs text-zinc-400">diagnóstico IA</p>
          </div>

          <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
            <span className="text-xs text-zinc-300 uppercase tracking-wide block mb-2">Projetos Ativos</span>
            <p className="text-xl font-semibold text-white">{projetosAtivos}</p>
            <p className="text-xs text-zinc-400">em andamento</p>
          </div>

          <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
            <span className="text-xs text-zinc-300 uppercase tracking-wide block mb-2">Concluídos</span>
            <p className="text-xl font-semibold text-white">{projetosConcluidos}</p>
            <p className="text-xs text-zinc-400">finalizados</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
