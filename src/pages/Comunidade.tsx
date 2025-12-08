import { useState } from "react";
import { CommunityFeed } from "@/components/comunidade/CommunityFeed";
import { MembersList } from "@/components/comunidade/MembersList";
import { RankingEngajamento } from "@/components/comunidade/RankingEngajamento";
import { CommunitySidebar } from "@/components/comunidade/CommunitySidebar";
import { MateriaisGratuitosTab } from "@/components/comunidade/MateriaisGratuitosTab";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { cn } from "@/lib/utils";

type TabValue = "community" | "members" | "leaderboard" | "materiais";

const tabs: { value: TabValue; label: string }[] = [
  { value: "community", label: "Feed" },
  { value: "members", label: "Membros" },
  { value: "leaderboard", label: "Ranking" },
  { value: "materiais", label: "Materiais" },
];

export default function Comunidade() {
  const { data: ranking } = useRankingEngajamento();
  const [activeTab, setActiveTab] = useState<TabValue>("community");

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Main Layout */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="border-r border-zinc-800">
            {/* Tab Navigation - X/Twitter Style */}
            <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "flex-1 py-4 px-4 text-sm font-medium transition-colors relative hover:bg-zinc-800/50",
                      activeTab === tab.value
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.value && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#9EB038] rounded-full" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[calc(100vh-60px)]">
              {activeTab === "community" && <CommunityFeed />}
              {activeTab === "members" && (
                <div className="p-4">
                  <MembersList />
                </div>
              )}
              {activeTab === "leaderboard" && (
                <div className="p-4">
                  <RankingEngajamento ranking={ranking || []} />
                </div>
              )}
              {activeTab === "materiais" && (
                <div className="p-4">
                  <MateriaisGratuitosTab />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-0 p-4">
              <CommunitySidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
