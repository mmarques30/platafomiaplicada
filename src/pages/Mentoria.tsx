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
import { FaseAtualCard } from "@/components/mentoria/FaseAtualCard";

import { BusinessAcessoRapido } from "@/components/mentoria/business/BusinessAcessoRapido";
import { BusinessROIChart } from "@/components/mentoria/BusinessROIChart";
import { BusinessTarefasCard } from "@/components/mentoria/BusinessTarefasCard";

import { BusinessExecutiveRoadmap } from "@/components/mentoria/business/BusinessExecutiveRoadmap";
import { BusinessEvolucaoAprendizado } from "@/components/mentoria/business/BusinessEvolucaoAprendizado";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Mentoria() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { isBusiness } = useEffectivePlan(isAdmin);

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-7xl">
      {/* Hero Dashboard */}
      <MentoriaHeroDashboard />

      {/* Acesso Rápido - Apenas para Business, abaixo do hero */}
      {isBusiness && <BusinessAcessoRapido />}

      {/* Tabs - Diferente para Business vs Academy */}
      <Tabs defaultValue="visao-geral" className="w-full mt-6">
        <TabsList className={`w-full md:w-auto grid ${isBusiness ? 'grid-cols-3' : 'grid-cols-2'} md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40 mb-6`}>
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
          {isBusiness && (
            <TabsTrigger
              value="evolucao-aprendizado"
              className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
            >
              Evolução Aprendizado
            </TabsTrigger>
          )}
        </TabsList>

        {/* Aba Visão Geral - Diferente para Business */}
        <TabsContent value="visao-geral" className="mt-0 space-y-4">
          {isBusiness ? (
            <>
              {/* Business: ROI → Tarefas */}
              <BusinessROIChart />
              <BusinessTarefasCard />
            </>
          ) : (
            <>
              {/* Academy: Layout original */}
              <PendenciasUrgentes />
              <div className="space-y-2">
                <StatusDiagnostico />
                <ProximaSessao />
              </div>
              <TarefasUrgentes />
              <NavegacaoRapida />
            </>
          )}
        </TabsContent>

        {/* Aba Roadmap (antiga Meu Processo) */}
        <TabsContent value="roadmap" className="mt-0 space-y-6">
          {isBusiness ? (
            <BusinessExecutiveRoadmap />
          ) : (
            <>
              <FaseAtualCard />
              <ResumoProgresso />
            </>
          )}
        </TabsContent>

        {/* Aba Evolução Aprendizado - Apenas Business */}
        {isBusiness && (
          <TabsContent value="evolucao-aprendizado" className="mt-0 space-y-6">
            <BusinessEvolucaoAprendizado />
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
}
