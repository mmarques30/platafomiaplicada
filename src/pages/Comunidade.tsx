import { CommunityFeed } from "@/components/comunidade/CommunityFeed";
import { MembersList } from "@/components/comunidade/MembersList";
import { RankingEngajamento } from "@/components/comunidade/RankingEngajamento";
import { CommunityHeroDashboard } from "@/components/comunidade/CommunityHeroDashboard";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/shared/PageContainer";

export default function Comunidade() {
  const { data: ranking } = useRankingEngajamento();

  return (
    <PageContainer>
      {/* Banner imersivo (título + stats inline) */}
      <CommunityHeroDashboard />

      {/* Conteúdo em coluna única centralizada (sem sidebar) */}
      <div className="mt-8">
        <Tabs defaultValue="feed" className="w-full">
          {/* Tabs centralizadas, estilo pill da marca */}
          <div className="flex justify-center mb-6">
            <TabsList className="inline-flex gap-1 bg-brand-cream/60 border border-brand-hairline p-1 rounded-full h-auto">
              <TabsTrigger
                value="feed"
                className="flex items-center justify-center gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-6 py-2 transition-colors text-sm"
              >
                Feed
              </TabsTrigger>
              <TabsTrigger
                value="ranking"
                className="flex items-center justify-center gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-6 py-2 transition-colors text-sm"
              >
                Ranking
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex items-center justify-center gap-2 text-muted-foreground data-[state=active]:bg-brand-strong data-[state=active]:text-brand-cream data-[state=active]:shadow-sm rounded-full px-6 py-2 transition-colors text-sm"
              >
                Membros
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="mt-0">
            <div className="max-w-2xl mx-auto">
              <CommunityFeed />
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <RankingEngajamento ranking={ranking || []} />
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <MembersList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
