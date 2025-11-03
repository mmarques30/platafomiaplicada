import { usePainelDiagnostico } from "@/hooks/usePainelDiagnostico";
import { InformacoesMentorado } from "@/components/mentoria/painel/InformacoesMentorado";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjetivosEstrategicos } from "@/components/mentoria/painel/ObjetivosEstrategicos";
import { ProjetosPriorizados } from "@/components/mentoria/painel/ProjetosPriorizados";
import { ProjetoPrincipal } from "@/components/mentoria/painel/ProjetoPrincipal";
import { IntegracoesAutomacoes } from "@/components/mentoria/painel/IntegracoesAutomacoes";
import { RoadmapTimeline } from "@/components/mentoria/painel/RoadmapTimeline";
import { PontosAtencao } from "@/components/mentoria/painel/PontosAtencao";
import { ProximaSessao } from "@/components/mentoria/painel/ProximaSessao";
import { ProjetoPreparacaoSection } from "@/components/mentoria/painel/ProjetoPreparacaoSection";
import { Loader2, ArrowLeft, FileText, Edit, Target, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { formatProjetoTitulo } from "@/lib/utils";

export default function MentoriaPainelDiagnostico() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { diagnostico, objetivos, projetos, sessoes, profile, isLoading } = usePainelDiagnostico(userId);

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/mentoria")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Mentoria
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Painel de Diagnóstico
          </h1>
          <p className="text-lg text-muted-foreground">
            {diagnostico.nome_completo || profile?.nome_completo}
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="container mx-auto px-4 max-w-7xl -mt-4 mb-8">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/mentoria/diagnostico")}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver Diagnóstico Completo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/mentoria/diagnostico?edit=true")}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar Diagnóstico
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/mentoria/objetivos")}
              className="gap-2"
            >
              <Target className="w-4 h-4" />
              Ver Todos Objetivos
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/mentoria/projetos")}
              className="gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Ver Todos Projetos
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className={`grid gap-8 ${proximaSessao ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Coluna Principal */}
          <div className={`space-y-8 ${proximaSessao ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
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

            {/* Preparação para Projetos */}
            {projetos.filter(p => p.status !== 'concluido' && p.status !== 'cancelado').length > 0 && (
              <Card className="bg-card text-card-foreground border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Preparação para Próximas Sessões</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Conteúdos recomendados para seus projetos ativos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {projetos
                    .filter(p => p.status !== 'concluido' && p.status !== 'cancelado')
                    .map(projeto => (
                      <ProjetoPreparacaoSection 
                        key={projeto.id}
                        projeto={projeto}
                        userId={userId || ''}
                      />
                    ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - só renderiza se houver sessão */}
          {proximaSessao && (
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ProximaSessao sessao={proximaSessao} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
