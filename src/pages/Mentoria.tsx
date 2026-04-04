import { useEffect, useState, useRef } from "react";
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
import { StatusDiagnostico } from "@/components/mentoria/StatusDiagnostico";
import { ProximaSessao } from "@/components/mentoria/ProximaSessao";
import { TarefasUrgentes } from "@/components/mentoria/TarefasUrgentes";
import { NavegacaoRapida } from "@/components/mentoria/NavegacaoRapida";

import { PendenciasUrgentes } from "@/components/mentoria/PendenciasUrgentes";
import { AcademyRoadmapEducacional } from "@/components/mentoria/AcademyRoadmapEducacional";
import { AcademyProximoPasso } from "@/components/mentoria/AcademyProximoPasso";

import { BusinessAcessoRapido } from "@/components/mentoria/business/BusinessAcessoRapido";

import { BusinessVisaoGeralGrid } from "@/components/mentoria/business/BusinessVisaoGeralGrid";

import { BusinessExecutiveRoadmap } from "@/components/mentoria/business/BusinessExecutiveRoadmap";
import { BusinessEvolucaoAprendizado } from "@/components/mentoria/business/BusinessEvolucaoAprendizado";
import { IAplicadaVisaoGeral } from "@/components/mentoria/business/IAplicadaVisaoGeral";
import { IAplicadaRoadmap } from "@/components/mentoria/business/IAplicadaRoadmap";
import { JornadaStrip } from "@/components/mentoria/JornadaStrip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Mentoria() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isBusiness, isBusinessParceria, isBusinessSistemas, isSkills, isAcademy } = useEffectivePlan(isAdmin, roleLoading);
  const [searchParams, setSearchParams] = useSearchParams();

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
  
  // Business Parceria: scroll contínuo com IntersectionObserver
  const [activeSection, setActiveSection] = useState('visao-geral');

  useEffect(() => {
    if (!isBusinessParceria) return;
    const sectionIds = ['visao-geral', 'roadmap', 'evolucao'];
    const observers = sectionIds.map(id => {
      const el = document.getElementById(`sec-${id}`);
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      }, { threshold: 0.3 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(obs => obs?.disconnect());
  }, [isBusinessParceria]);

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

  const sectionLabels = ['Visão Geral', 'Roadmap', 'Evolução'];
  const sectionIds = ['visao-geral', 'roadmap', 'evolucao'];

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-7xl">
      {/* Hero Dashboard */}
      <MentoriaHeroDashboard />

      {/* Acesso Rápido - Apenas para Business, abaixo do hero */}
      {isBusiness && <BusinessAcessoRapido />}

      {/* Jornada Strip - linha de estágios */}
      {(isBusinessParceria || isBusinessSistemas) && estagiosBusiness && <JornadaStrip estagios={estagiosBusiness} />}
      {isAcademy && <JornadaStrip estagios={estagiosAcademy} />}

      {/* Business Parceria: scroll contínuo com nav-pill sticky */}
      {isBusinessParceria ? (
        <>
          {/* Nav-pill sticky */}
          <div className="sticky top-[64px] z-40 bg-background/80 backdrop-blur py-3 mt-6">
            <div className="flex gap-1">
              {sectionIds.map((id, i) => (
                <button
                  key={id}
                  onClick={() => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 16,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: activeSection === id ? '#AFC040' : 'transparent',
                    color: activeSection === id ? '#0C0F0A' : 'hsl(var(--muted-foreground))',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {sectionLabels[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Seções contínuas */}
          <section id="sec-visao-geral" className="scroll-mt-28 mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Visão Geral</h2>
            <BusinessVisaoGeralGrid />
          </section>

          <section id="sec-roadmap" className="scroll-mt-28 mt-10 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Roadmap</h2>
            <BusinessExecutiveRoadmap />
          </section>

          <section id="sec-evolucao" className="scroll-mt-28 mt-10 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Evolução Aprendizado</h2>
            <BusinessEvolucaoAprendizado />
          </section>
        </>
      ) : (
        /* Academy, Sistemas, etc.: manter abas */
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-6">
          <TabsList className={`w-full md:w-auto grid ${showEvolucaoTab ? 'grid-cols-3' : 'grid-cols-2'} md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40 mb-6`}>
            <TabsTrigger
              value="visao-geral"
              className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="roadmap"
              className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
            >
              Roadmap
            </TabsTrigger>
            {showEvolucaoTab && (
              <TabsTrigger
                value="evolucao-aprendizado"
                className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
              >
                Evolução Aprendizado
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="visao-geral" className="mt-0 space-y-4">
            {isBusinessSistemas ? (
              <IAplicadaVisaoGeral />
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
      )}
    </div>
  );
}