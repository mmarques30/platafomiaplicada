import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RankingComunidade } from "@/components/evolucao/RankingComunidade";
import { EstatisticasEngajamento } from "@/components/evolucao/EstatisticasEngajamento";
import { FerramentasCompartilhadasList } from "@/components/evolucao/FerramentasCompartilhadasList";
import { HeroEvolucao } from "@/components/evolucao/HeroEvolucao";
import { HeroComunidade } from "@/components/evolucao/HeroComunidade";
import { TimelineJornada } from "@/components/evolucao/TimelineJornada";
import { TrilhasEmAndamentoCards } from "@/components/evolucao/TrilhasEmAndamentoCards";
import { VitrineConquistas } from "@/components/evolucao/VitrineConquistas";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { AbaDuvidas } from "@/components/evolucao/AbaDuvidas";
import { AbaFavoritos } from "@/components/evolucao/AbaFavoritos";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";

export default function Evolucao() {
  const { data: ranking, isLoading: loadingRanking } = useRankingComunidade();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Minha <span className="text-primary">Evolução</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          Acompanhe seu progresso e conquistas
        </p>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="minha-evolucao" className="w-full">
        <TabsList className="w-full justify-start bg-transparent h-auto border-b border-border gap-2">
          <TabsTrigger 
            value="minha-evolucao"
            className="px-6 py-3 text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none"
          >
            Evolução
          </TabsTrigger>
          <TabsTrigger 
            value="comunidade"
            className="px-6 py-3 text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none"
          >
            Aplicados
          </TabsTrigger>
          <TabsTrigger 
            value="favoritos"
            className="px-6 py-3 text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none"
          >
            Favoritos
          </TabsTrigger>
          <TabsTrigger 
            value="duvidas"
            className="px-6 py-3 text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none"
          >
            Dúvidas
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: MINHA EVOLUÇÃO */}
        <TabsContent value="minha-evolucao" className="space-y-6 mt-6">
          {/* Hero com nível e XP */}
          <HeroEvolucao />

          {/* Minha Jornada */}
          <TimelineJornada />

              {/* Trilhas em Andamento */}
              <TrilhasEmAndamentoCards />

          {/* Conquistas */}
          <VitrineConquistas />
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

              {/* Estatísticas Gerais da Comunidade */}
              <EstatisticasEngajamento ranking={ranking || []} />

              {/* Ferramentas Mais Compartilhadas */}
              <FerramentasCompartilhadasList />
            </>
          )}
        </TabsContent>

        {/* ABA 3: FAVORITOS */}
        <TabsContent value="favoritos" className="space-y-6 mt-6">
          <AbaFavoritos />
        </TabsContent>

        {/* ABA 4: DÚVIDAS */}
        <TabsContent value="duvidas" className="space-y-6 mt-6">
          <AbaDuvidas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
