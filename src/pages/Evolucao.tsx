import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";


import { RankingComunidade } from "@/components/evolucao/RankingComunidade";
import { HeroEvolucao } from "@/components/evolucao/HeroEvolucao";
import { HeroComunidade } from "@/components/evolucao/HeroComunidade";
import { TrilhasEmAndamentoCards } from "@/components/evolucao/TrilhasEmAndamentoCards";
import { VitrineConquistas } from "@/components/evolucao/VitrineConquistas";
import { BonusEvolucao } from "@/components/evolucao/BonusEvolucao";
import { BusinessProgressoConteudo } from "@/components/mentoria/business/BusinessProgressoConteudo";
import { BusinessEvolucaoAprendizado } from "@/components/mentoria/business/BusinessEvolucaoAprendizado";
import { AbaFavoritos } from "@/components/evolucao/AbaFavoritos";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageSkeleton } from "@/components/shared/PageSkeleton";


export default function Evolucao() {
  const { data: ranking, isLoading: loadingRanking } = useRankingComunidade();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isAcademy, isBusiness } = useEffectivePlan(isAdmin, roleLoading);

  if (roleLoading) {
    return <PageSkeleton variant="evolucao" />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <PageTitle primary="Minha" secondary="Evolução" />
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="minha-evolucao" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
          <TabsTrigger 
            value="minha-evolucao"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            Evolução
          </TabsTrigger>
          <TabsTrigger 
            value="comunidade"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            Ranking
          </TabsTrigger>
          <TabsTrigger 
            value="favoritos"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            Favoritos
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: MINHA EVOLUÇÃO */}
        <TabsContent value="minha-evolucao" className="space-y-6 mt-6">
          <HeroEvolucao />
          {isBusiness && <BusinessProgressoConteudo />}
          {isBusiness && <BusinessEvolucaoAprendizado />}
          <TrilhasEmAndamentoCards />
          <VitrineConquistas />
          {isAcademy && <BonusEvolucao />}
        </TabsContent>

        {/* ABA 2: EVOLUÇÃO DA COMUNIDADE */}
        <TabsContent value="comunidade" className="space-y-6 mt-6">
          {loadingRanking ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              {/* Hero Comunidade */}
              <HeroComunidade />

              {/* Ranking Top 3 + Lista */}
              <RankingComunidade ranking={ranking as any || []} />
            </>
          )}
        </TabsContent>

        {/* ABA 3: FAVORITOS */}
        <TabsContent value="favoritos" className="space-y-6 mt-6">
          <AbaFavoritos />
        </TabsContent>
      </Tabs>
    </div>
  );
}
