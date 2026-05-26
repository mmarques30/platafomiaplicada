import { CommunityFeed } from "@/components/comunidade/CommunityFeed";
import { MembersList } from "@/components/comunidade/MembersList";

import { RankingEngajamento } from "@/components/comunidade/RankingEngajamento";
import { CommunityHeroDashboard } from "@/components/comunidade/CommunityHeroDashboard";
import { CommunitySidebar } from "@/components/comunidade/CommunitySidebar";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";

export default function Comunidade() {
  const { data: ranking } = useRankingEngajamento();

  return (
    <PageContainer>
      <PageTitle
        primary="Comunidade"
        secondary="aplicada"
        eyebrow="Comunidade"
        description="Quem está aplicando IA na rotina, ao vivo."
      />

        {/* Hero Dashboard */}
        <CommunityHeroDashboard />

        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="feed" className="w-full">
              {/* Tabs estilo pill da marca */}
              <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex gap-0.5 sm:gap-1 bg-brand-cream/60 border border-brand-hairline p-1 rounded-full mb-6 h-auto">
                <TabsTrigger
                  value="feed"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-3 sm:px-5 py-1.5 sm:py-2 transition-colors text-xs sm:text-sm"
                >
                  Feed
                </TabsTrigger>
                <TabsTrigger
                  value="ranking"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-3 sm:px-5 py-1.5 sm:py-2 transition-colors text-xs sm:text-sm"
                >
                  Ranking
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-3 sm:px-5 py-1.5 sm:py-2 transition-colors text-xs sm:text-sm"
                >
                  Membros
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="mt-0">
                <div className="bg-brand-cream-soft rounded-2xl border border-brand-hairline overflow-hidden">
                  <CommunityFeed />
                </div>
              </TabsContent>

              <TabsContent value="ranking" className="mt-0">
                <RankingEngajamento ranking={ranking || []} />
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <MembersList />
              </TabsContent>

            </Tabs>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <CommunitySidebar />
          </div>
        </div>
    </PageContainer>
  );
}
