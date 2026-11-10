import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { RankingComunidade } from "@/components/evolucao/RankingComunidade";
import { HeroEvolucao } from "@/components/evolucao/HeroEvolucao";
import { HeroComunidade } from "@/components/evolucao/HeroComunidade";
import { TrilhasEmAndamentoCards } from "@/components/evolucao/TrilhasEmAndamentoCards";
import { VitrineConquistas } from "@/components/evolucao/VitrineConquistas";
import { RitmoCard } from "@/components/evolucao/RitmoCard";
import { DistribuicaoConstancia } from "@/components/evolucao/DistribuicaoConstancia";
import { BonusEvolucao } from "@/components/evolucao/BonusEvolucao";
import { AtalhosProgresso } from "@/components/evolucao/AtalhosProgresso";
import { AbaFavoritos } from "@/components/evolucao/AbaFavoritos";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

const TAB_CLASS = "sm:px-5";

/**
 * "Meu progresso" — visão única da Academy. Ex-Builder e ex-Skills (hoje
 * Academy) e a equipe caem aqui; o painel antigo de mentoria ficou
 * restrito ao Insider Business.
 */
export default function Evolucao() {
  const { data: ranking, isLoading: loadingRanking } = useRankingComunidade();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isBusinessSistemas } = useEffectivePlan(isAdmin, roleLoading);

  if (roleLoading) {
    return <PageSkeleton variant="evolucao" />;
  }

  return (
    <PageContainer>
      <PageTitle primary="Meu" secondary="progresso" />

      <Tabs defaultValue="minha-evolucao" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-full bg-muted p-1 sm:inline-flex sm:w-auto">
          <TabsTrigger value="minha-evolucao" className={TAB_CLASS}>
            Evolução
          </TabsTrigger>
          <TabsTrigger value="comunidade" className={TAB_CLASS}>
            Ranking
          </TabsTrigger>
          <TabsTrigger value="favoritos" className={TAB_CLASS}>
            Favoritos
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: EVOLUÇÃO */}
        <TabsContent value="minha-evolucao" className="mt-6 space-y-6">
          <HeroEvolucao />

          {/* Os gráficos primeiro: quem abre "Meu progresso" quer ver o
              progresso desenhado, não uma lista de atalhos. */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RitmoCard />
            </div>
            <AtalhosProgresso />
          </div>

          <DistribuicaoConstancia />

          <TrilhasEmAndamentoCards />

          <VitrineConquistas />
          {!isBusinessSistemas && <BonusEvolucao />}
        </TabsContent>

        {/* ABA 2: RANKING DA COMUNIDADE */}
        <TabsContent value="comunidade" className="mt-6 space-y-6">
          {loadingRanking ? (
            <Skeleton className="h-96 w-full rounded-2xl" />
          ) : (
            <>
              <HeroComunidade />
              <RankingComunidade ranking={(ranking as any) || []} />
            </>
          )}
        </TabsContent>

        {/* ABA 3: FAVORITOS */}
        <TabsContent value="favoritos" className="mt-6 space-y-6">
          <AbaFavoritos />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
