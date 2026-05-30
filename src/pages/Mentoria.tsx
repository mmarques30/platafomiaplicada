import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingTracking } from "@/hooks/useOnboardingTracking";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { MentoriaHeroDashboard } from "@/components/mentoria/MentoriaHeroDashboard";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatusDiagnostico } from "@/components/mentoria/StatusDiagnostico";
import { ProximaSessao } from "@/components/mentoria/ProximaSessao";
import { TarefasUrgentes } from "@/components/mentoria/TarefasUrgentes";
import { NavegacaoRapida } from "@/components/mentoria/NavegacaoRapida";

import { PendenciasUrgentes } from "@/components/mentoria/PendenciasUrgentes";
import { AcademyRoadmapEducacional } from "@/components/mentoria/AcademyRoadmapEducacional";
import { AcademyProximoPasso } from "@/components/mentoria/AcademyProximoPasso";

import { BusinessAcessoRapido } from "@/components/mentoria/business/BusinessAcessoRapido";

import { BusinessVisaoGeralGrid } from "@/components/mentoria/business/BusinessVisaoGeralGrid";


import { BusinessEvolucaoAprendizado } from "@/components/mentoria/business/BusinessEvolucaoAprendizado";
import { IAplicadaVisaoGeral } from "@/components/mentoria/business/IAplicadaVisaoGeral";
import { IAplicadaRoadmap } from "@/components/mentoria/business/IAplicadaRoadmap";
import { BusinessExecutiveRoadmap } from "@/components/mentoria/business/BusinessExecutiveRoadmap";
import { JornadaStrip } from "@/components/mentoria/JornadaStrip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Mentoria() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isBusiness, isBusinessParceria, isBusinessSistemas, isSkills, isAcademy } = useEffectivePlan(isAdmin, roleLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const { track } = useOnboardingTracking();
  const trackedRoadmapRef = useRef(false);

  useEffect(() => {
    if (!user?.id || trackedRoadmapRef.current) return;
    const chave = `roadmap_visto_${user.id}`;
    if (!localStorage.getItem(chave)) {
      trackedRoadmapRef.current = true;
      track('roadmap_visitado');
      localStorage.setItem(chave, 'true');
    }
  }, [user?.id, track]);

  // Business stages
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas } = useEtapasBusiness(contrato?.id);
  const estagiosBusiness = etapas && etapas.length > 0
    ? etapas.map((e, i) => ({
        numero: i + 1,
        label: e.titulo,
        status: e.status === 'concluida' ? 'concluido' as const
          : e.status === 'em_andamento' ? 'atual' as const
          : 'proximo' as const,
      }))
    : null;

  // Academy stages
  const { formulario } = useMentoriaForm();
  const diagCompleto = formulario?.completado === true;
  const estagiosAcademy = [
    { numero: 1, label: 'Diagnóstico', status: diagCompleto ? 'concluido' as const : 'atual' as const },
    { numero: 2, label: 'Trilhas', status: diagCompleto ? 'atual' as const : 'proximo' as const },
    { numero: 3, label: 'Conquistas', status: 'proximo' as const },
    { numero: 4, label: 'Certificado', status: 'proximo' as const },
  ];
  
  // Redirecionar usuários Skills para suas páginas específicas
  useEffect(() => {
    if (isSkills && !isBusiness) {
      const tab = searchParams.get("tab");
      if (tab === "roadmap") {
        navigate('/skills/roadmap', { replace: true });
      } else {
        navigate('/skills/equipe', { replace: true });
      }
    }
  }, [isSkills, isBusiness, navigate, searchParams]);

  // Se Skills (sem Business), não renderizar (aguardar redirect)
  if (isSkills && !isBusiness) {
    return null;
  }
  
  // Mostrar aba Evolução apenas para Business Parceria (não Sistemas)
  const showEvolucaoTab = isBusiness && !isBusinessSistemas;
  
  // Ler tab da URL ou usar padrão
  const tabFromUrl = searchParams.get("tab");
  const validTabs = ["visao-geral", "roadmap", "evolucao-aprendizado"];
  const activeTab = validTabs.includes(tabFromUrl || "") ? tabFromUrl! : "visao-geral";

  const handleTabChange = (value: string) => {
    if (value === "visao-geral") {
      searchParams.delete("tab");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tab: value });
    }
  };

  return (
    <PageContainer>
      {/* Hero Dashboard */}
      <MentoriaHeroDashboard />

      {/* Acesso Rápido - Apenas para Business, abaixo do hero */}
      {isBusiness && <BusinessAcessoRapido />}

      {/* Jornada Strip - linha de estágios */}
      {isBusinessSistemas && estagiosBusiness && <JornadaStrip estagios={estagiosBusiness} />}
      {isAcademy && <JornadaStrip estagios={estagiosAcademy} />}

      {/* Abas (por página) — unificado para Academy, Sistemas e Business Parceria */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-6">
        <div className="flex mb-6">
          <TabsList className="inline-flex gap-1 bg-brand-cream/60 border border-brand-hairline p-1 rounded-full h-auto">
            <TabsTrigger
              value="visao-geral"
              className="flex items-center justify-center gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-5 py-2 transition-colors text-sm"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="roadmap"
              className="flex items-center justify-center gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-5 py-2 transition-colors text-sm"
            >
              Roadmap
            </TabsTrigger>
            {showEvolucaoTab && (
              <TabsTrigger
                value="evolucao-aprendizado"
                className="flex items-center justify-center gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-5 py-2 transition-colors text-sm"
              >
                Evolução
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="visao-geral" className="mt-0 space-y-4">
          {isBusinessSistemas ? (
            <IAplicadaVisaoGeral />
          ) : isBusinessParceria ? (
            <BusinessVisaoGeralGrid />
          ) : (
            <>
              <PendenciasUrgentes />
              <AcademyProximoPasso />
              <div className="space-y-2">
                <StatusDiagnostico />
                <ProximaSessao />
              </div>
              <TarefasUrgentes />
            </>
          )}
        </TabsContent>

        <TabsContent value="roadmap" className="mt-0 space-y-6">
          {isBusinessSistemas ? (
            <IAplicadaRoadmap />
          ) : isBusinessParceria ? (
            <BusinessExecutiveRoadmap />
          ) : (
            <AcademyRoadmapEducacional />
          )}
        </TabsContent>

        {showEvolucaoTab && (
          <TabsContent value="evolucao-aprendizado" className="mt-0 space-y-6">
            <BusinessEvolucaoAprendizado />
          </TabsContent>
        )}
      </Tabs>
    </PageContainer>
  );
}