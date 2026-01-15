import { usePainelDiagnostico } from "@/hooks/usePainelDiagnostico";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { InformacoesMentorado } from "@/components/mentoria/painel/InformacoesMentorado";
import { ProjetosPriorizados } from "@/components/mentoria/painel/ProjetosPriorizados";
import { ProjetoPrincipal } from "@/components/mentoria/painel/ProjetoPrincipal";
import { IntegracoesAutomacoes } from "@/components/mentoria/painel/IntegracoesAutomacoes";
import { RoadmapTimeline } from "@/components/mentoria/painel/RoadmapTimeline";
import { PontosAtencao } from "@/components/mentoria/painel/PontosAtencao";
import { ProximaSessao } from "@/components/mentoria/painel/ProximaSessao";
import { ProjetoPreparacaoSection } from "@/components/mentoria/painel/ProjetoPreparacaoSection";
import { PainelDiagnosticoShell } from "@/components/mentoria/painel/PainelDiagnosticoShell";
import { PainelCard, PainelCardHeader } from "@/components/mentoria/painel/PainelCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPainelTheme } from "@/components/mentoria/painel/painelTheme";

export default function MentoriaPainelDiagnostico() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const { diagnostico, projetos, sessoes, profile, isLoading } = usePainelDiagnostico(userId);
  const { plan } = useUserPlan();
  const { isAdmin, isVisitante, isLoading: roleLoading } = useUserRole();
  
  // Determinar se é Business view (considera admin visualizando mentorado business)
  // Só calcula isBusiness quando o profile já estiver carregado (para evitar false negatives)
  const painelPlano = (isAdmin && userId && profile) ? profile.plano_mentoria : plan;
  const isBusiness = painelPlano === "business";
  const theme = getPainelTheme(isBusiness);
  
  // Debug temporário - remover após validação
  console.log("🔍 Debug isBusiness:", {
    isAdmin,
    userId,
    profileLoaded: !!profile,
    profilePlanoMentoria: profile?.plano_mentoria,
    planFromHook: plan,
    painelPlano,
    isBusiness
  });
  
  // Redirecionar visitantes
  useEffect(() => {
    if (!roleLoading && isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
    }
  }, [isVisitante, roleLoading, navigate]);
  
  const isAcademyRoute = location.pathname.startsWith('/diagnostico');
  
  const voltarUrl = isAdmin 
    ? '/mentoria' 
    : !plan 
      ? '/comunidade' 
      : (plan === 'academy' || isAcademyRoute)
        ? '/meu-diagnostico' 
        : '/mentoria';
  
  const voltarLabel = isAdmin 
    ? 'Voltar para Mentoria' 
    : !plan 
      ? 'Voltar para Comunidade' 
      : (plan === 'academy' || isAcademyRoute)
        ? 'Voltar para Meu Diagnóstico' 
        : 'Voltar para Mentoria';

  if (isLoading || roleLoading || isVisitante) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <PainelDiagnosticoShell
      isBusiness={isBusiness}
      diagnostico={diagnostico}
      profile={profile}
      voltarUrl={voltarUrl}
      voltarLabel={voltarLabel}
      isAcademyRoute={isAcademyRoute}
    >
      <div className={`grid gap-8 ${proximaSessao ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Coluna Principal */}
        <div className={`space-y-8 ${proximaSessao ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          <InformacoesMentorado diagnostico={diagnostico} profile={profile} isBusiness={isBusiness} />

          {projetosPrioritarios.length > 0 && (
            <ProjetosPriorizados projetos={projetosPrioritarios} isBusiness={isBusiness} />
          )}

          {projetoPrincipal && (
            <ProjetoPrincipal projeto={projetoPrincipal} isBusiness={isBusiness} />
          )}

          <IntegracoesAutomacoes diagnostico={diagnostico} isBusiness={isBusiness} />

          {sessoes.length > 0 && (
            <RoadmapTimeline sessoes={sessoes} isBusiness={isBusiness} />
          )}

          <PontosAtencao 
            nome={diagnostico.nome_completo || profile?.nome_completo || ''} 
            diagnostico={diagnostico}
            isBusiness={isBusiness}
          />

          {projetos.filter(p => p.status !== 'concluido' && p.status !== 'cancelado').length > 0 && (
            <PainelCard isBusiness={isBusiness}>
              <PainelCardHeader 
                title="Preparação para Próximas Sessões"
                description="Conteúdos recomendados para seus projetos ativos"
                isBusiness={isBusiness}
              />
              <div className="space-y-6">
                {projetos
                  .filter(p => p.status !== 'concluido' && p.status !== 'cancelado')
                  .sort((a, b) => {
                    if (a.data_entrega && b.data_entrega) {
                      return new Date(a.data_entrega).getTime() - new Date(b.data_entrega).getTime();
                    }
                    if (a.data_entrega && !b.data_entrega) return -1;
                    if (!a.data_entrega && b.data_entrega) return 1;
                    return a.titulo.localeCompare(b.titulo);
                  })
                  .map(projeto => (
                    <ProjetoPreparacaoSection 
                      key={projeto.id}
                      projeto={projeto}
                      userId={userId || ''}
                      isBusiness={isBusiness}
                    />
                  ))}
              </div>
            </PainelCard>
          )}
        </div>

        {/* Sidebar */}
        {proximaSessao && (
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProximaSessao sessao={proximaSessao} isBusiness={isBusiness} />
            </div>
          </div>
        )}
      </div>
    </PainelDiagnosticoShell>
  );
}
