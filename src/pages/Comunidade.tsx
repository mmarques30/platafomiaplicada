import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityFeed } from "@/components/comunidade/CommunityFeed";
import { MembersList } from "@/components/comunidade/MembersList";
import { RankingComunidade } from "@/components/evolucao/RankingComunidade";
import { CommunitySidebar } from "@/components/comunidade/CommunitySidebar";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";

export default function Comunidade() {
  const { data: ranking } = useRankingComunidade();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          IAplicada Community
        </h1>
        <p className="text-muted-foreground">
          Conecte-se, aprenda e compartilhe conhecimento sobre IA aplicada
        </p>
      </div>

      {/* Main Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content */}
          <div>
            <Tabs defaultValue="community" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger
                  value="community"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Comunidade
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Membros
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Ranking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="community" className="space-y-4">
                <CommunityFeed />
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <MembersList />
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4">
                <RankingComunidade ranking={ranking || []} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <CommunitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
