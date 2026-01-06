import { CommunityFeed } from "@/components/comunidade/CommunityFeed";
import { MembersList } from "@/components/comunidade/MembersList";
import { PlayersList } from "@/components/comunidade/PlayersList";
import { RankingEngajamento } from "@/components/comunidade/RankingEngajamento";
import { CommunityHeroDashboard } from "@/components/comunidade/CommunityHeroDashboard";
import { CommunitySidebar } from "@/components/comunidade/CommunitySidebar";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";

export default function Comunidade() {
  const { data: ranking } = useRankingEngajamento();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <section className="mb-6">
          <PageTitle primary="Comunidade" secondary="Aplicada" icon={<Users className="h-7 w-7 text-primary" />} />
        </section>

        {/* Hero Dashboard */}
        <CommunityHeroDashboard />

        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="feed" className="w-full">
              {/* Standardized Tabs */}
              <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40 mb-6">
                <TabsTrigger 
                  value="feed"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
                >
                  Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="ranking"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
                >
                  Ranking
                </TabsTrigger>
                <TabsTrigger 
                  value="members"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
                >
                  Membros
                </TabsTrigger>
                <TabsTrigger 
                  value="players"
                  className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
                >
                  Players
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="mt-0">
                <div className="bg-card rounded-xl border overflow-hidden">
                  <CommunityFeed />
                </div>
              </TabsContent>

              <TabsContent value="ranking" className="mt-0">
                <RankingEngajamento ranking={ranking || []} />
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <MembersList />
              </TabsContent>

              <TabsContent value="players" className="mt-0">
                <PlayersList />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <CommunitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
