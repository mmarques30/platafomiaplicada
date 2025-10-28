import { usePainelDiagnostico } from "@/hooks/usePainelDiagnostico";
import { InformacoesMentorado } from "@/components/mentoria/painel/InformacoesMentorado";
import { ObjetivosEstrategicos } from "@/components/mentoria/painel/ObjetivosEstrategicos";
import { ProjetosPriorizados } from "@/components/mentoria/painel/ProjetosPriorizados";
import { ProjetoPrincipal } from "@/components/mentoria/painel/ProjetoPrincipal";
import { IntegracoesAutomacoes } from "@/components/mentoria/painel/IntegracoesAutomacoes";
import { RoadmapTimeline } from "@/components/mentoria/painel/RoadmapTimeline";
import { PontosAtencao } from "@/components/mentoria/painel/PontosAtencao";
import { ProximaSessao } from "@/components/mentoria/painel/ProximaSessao";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function MentoriaPainelDiagnostico() {
  const navigate = useNavigate();
  const { diagnostico, objetivos, projetos, sessoes, profile, isLoading } = usePainelDiagnostico();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-aplicada-green-900" />
      </div>
    );
  }

  if (!diagnostico) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-aplicada-dark mb-4">
            Diagnóstico não encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            Complete o formulário de diagnóstico para visualizar seu painel personalizado.
          </p>
          <Button onClick={() => navigate("/mentoria/diagnostico")}>
            Preencher Diagnóstico
          </Button>
        </div>
      </div>
    );
  }

  const projetosPrioritarios = projetos.slice(0, 5);
  const projetoPrincipal = projetos[0];
  const proximaSessao = sessoes.find(s => new Date(s.data_sessao) > new Date() && s.status === 'agendada');

  return (
    <div className="min-h-screen bg-aplicada-gray">
      {/* Header */}
      <div className="bg-white border-b border-aplicada-green-100">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/mentoria")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Mentoria
          </Button>
          <h1 className="text-4xl font-bold text-aplicada-dark mb-2">
            Painel de Diagnóstico
          </h1>
          <p className="text-lg text-muted-foreground">
            {diagnostico.nome_completo || profile?.nome_completo}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações do Mentorado */}
            <InformacoesMentorado diagnostico={diagnostico} profile={profile} />

            {/* Objetivos Estratégicos */}
            {objetivos.length > 0 && (
              <ObjetivosEstrategicos objetivos={objetivos} />
            )}

            {/* Projetos Priorizados */}
            {projetosPrioritarios.length > 0 && (
              <ProjetosPriorizados projetos={projetosPrioritarios} />
            )}

            {/* Projeto Principal */}
            {projetoPrincipal && (
              <ProjetoPrincipal projeto={projetoPrincipal} />
            )}

            {/* Integrações e Automações */}
            <IntegracoesAutomacoes diagnostico={diagnostico} />

            {/* Roadmap e Timeline */}
            {sessoes.length > 0 && (
              <RoadmapTimeline sessoes={sessoes} />
            )}

            {/* Pontos de Atenção Especiais */}
            <PontosAtencao 
              nome={diagnostico.nome_completo || profile?.nome_completo || ''} 
              diagnostico={diagnostico} 
            />
          </div>

          {/* Sidebar - Próxima Sessão */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProximaSessao sessao={proximaSessao} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
