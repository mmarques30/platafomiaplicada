import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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
        <TabsList className="w-full justify-start bg-transparent h-auto gap-1 md:gap-2 overflow-x-auto flex-nowrap">
          <TabsTrigger 
            value="minha-evolucao"
            className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none whitespace-nowrap"
          >
            Evolução
          </TabsTrigger>
          <TabsTrigger 
            value="comunidade"
            className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none whitespace-nowrap"
          >
            Ranking IAplicada
          </TabsTrigger>
          <TabsTrigger 
            value="favoritos"
            className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none whitespace-nowrap"
          >
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
