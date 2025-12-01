import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityFeed } from "@/components/comunidade/CommunityFeed";
import { MembersList } from "@/components/comunidade/MembersList";
import { RankingEngajamento } from "@/components/comunidade/RankingEngajamento";
import { CommunitySidebar } from "@/components/comunidade/CommunitySidebar";
import { MateriaisGratuitosTab } from "@/components/comunidade/MateriaisGratuitosTab";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";

export default function Comunidade() {
  const { data: ranking } = useRankingEngajamento();

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
              <TabsList className="grid w-full grid-cols-4 bg-muted">
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
                <TabsTrigger
                  value="materiais"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Materiais
                </TabsTrigger>
              </TabsList>

              <TabsContent value="community" className="space-y-4">
                <CommunityFeed />
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <MembersList />
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4">
                <RankingEngajamento ranking={ranking || []} />
              </TabsContent>

              <TabsContent value="materiais" className="space-y-4">
                <MateriaisGratuitosTab />
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
