import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Trophy, Star } from "lucide-react";

import { RankingComunidade } from "@/components/evolucao/RankingComunidade";
import { FerramentasCompartilhadasList } from "@/components/evolucao/FerramentasCompartilhadasList";
import { CompartilharFerramentaModal } from "@/components/evolucao/CompartilharFerramentaModal";
import { HeroEvolucao } from "@/components/evolucao/HeroEvolucao";
import { HeroComunidade } from "@/components/evolucao/HeroComunidade";
import { TrilhasEmAndamentoCards } from "@/components/evolucao/TrilhasEmAndamentoCards";
import { VitrineConquistas } from "@/components/evolucao/VitrineConquistas";
import { BonusEvolucao } from "@/components/evolucao/BonusEvolucao";
import { AbaFavoritos } from "@/components/evolucao/AbaFavoritos";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PageTitle } from "@/components/shared/PageTitle";


export default function Evolucao() {
  const { data: ranking, isLoading: loadingRanking } = useRankingComunidade();
  const { isAcademy } = useUserPlan();
  
  const [modalFerramentaOpen, setModalFerramentaOpen] = useState(false);


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
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Evolução
          </TabsTrigger>
          <TabsTrigger 
            value="comunidade"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger 
            value="favoritos"
            className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
          >
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Favoritos
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: MINHA EVOLUÇÃO */}
        <TabsContent value="minha-evolucao" className="space-y-6 mt-6">
          <HeroEvolucao />
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

              {/* Ferramentas Mais Compartilhadas */}
              <FerramentasCompartilhadasList onCompartilhar={() => setModalFerramentaOpen(true)} />
              
              <CompartilharFerramentaModal 
                open={modalFerramentaOpen} 
                onOpenChange={setModalFerramentaOpen} 
              />
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
