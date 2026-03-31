import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { MentoriaHeroDashboard } from "@/components/mentoria/MentoriaHeroDashboard";
import { StatusDiagnostico } from "@/components/mentoria/StatusDiagnostico";
import { ProximaSessao } from "@/components/mentoria/ProximaSessao";
import { TarefasUrgentes } from "@/components/mentoria/TarefasUrgentes";
import { NavegacaoRapida } from "@/components/mentoria/NavegacaoRapida";
import { ResumoProgresso } from "@/components/mentoria/ResumoProgresso";
import { PendenciasUrgentes } from "@/components/mentoria/PendenciasUrgentes";
import { AcademyRoadmapEducacional } from "@/components/mentoria/AcademyRoadmapEducacional";
import { AcademyProximoPasso } from "@/components/mentoria/AcademyProximoPasso";

import { BusinessAcessoRapido } from "@/components/mentoria/business/BusinessAcessoRapido";
import { BusinessROIChart } from "@/components/mentoria/BusinessROIChart";
import BusinessReportsCard from "@/components/mentoria/business/BusinessReportsCard";
import { BusinessProgressoConteudo } from "@/components/mentoria/business/BusinessProgressoConteudo";
import { BusinessExecutiveRoadmap } from "@/components/mentoria/business/BusinessExecutiveRoadmap";
import { BusinessEvolucaoAprendizado } from "@/components/mentoria/business/BusinessEvolucaoAprendizado";
import { IAplicadaVisaoGeral } from "@/components/mentoria/business/IAplicadaVisaoGeral";
import { IAplicadaRoadmap } from "@/components/mentoria/business/IAplicadaRoadmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Mentoria() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isBusiness, isBusinessParceria, isBusinessSistemas, isSkills } = useEffectivePlan(isAdmin, roleLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Redirecionar usuários Skills para suas páginas específicas
  useEffect(() => {
    if (isSkills && !isBusiness) {
      const tab = searchParams.get("tab");
      // Mapear tabs para rotas Skills
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
      // Remover parâmetro tab quando for visão geral (URL limpa)
      searchParams.delete("tab");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tab: value });
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-7xl">
      {/* Hero Dashboard */}
      <MentoriaHeroDashboard />

      {/* Acesso Rápido - Apenas para Business, abaixo do hero */}
      {isBusiness && <BusinessAcessoRapido />}

      {/* Tabs - Diferente para Business vs Academy */}
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

        {/* Aba Visão Geral - Diferente para cada tipo */}
        <TabsContent value="visao-geral" className="mt-0 space-y-4">
          {isBusinessSistemas ? (
            <IAplicadaVisaoGeral />
          ) : isBusiness ? (
            <>
              {/* Business Colaborativo: ROI → Progresso → Reports */}
              <BusinessROIChart />
              <BusinessProgressoConteudo />
              <BusinessReportsCard />
            </>
          ) : (
            <>
              {/* Academy: Layout com próximo passo inteligente */}
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

        {/* Aba Roadmap - Diferente para cada tipo */}
        <TabsContent value="roadmap" className="mt-0 space-y-6">
          {isBusinessSistemas ? (
            <IAplicadaRoadmap />
          ) : isBusiness ? (
            <BusinessExecutiveRoadmap />
          ) : (
            <>
              <FaseAtualCard />
              <ResumoProgresso />
            </>
          )}
        </TabsContent>

        {/* Aba Evolução Aprendizado - Apenas Business Colaborativo */}
        {showEvolucaoTab && (
          <TabsContent value="evolucao-aprendizado" className="mt-0 space-y-6">
            <BusinessProgressoConteudo />
            <BusinessEvolucaoAprendizado />
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
}