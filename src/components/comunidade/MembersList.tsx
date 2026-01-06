import { useState } from "react";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { MemberCard } from "./MemberCard";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MembersList() {
  const [filter, setFilter] = useState<"all" | "facilitador" | "online">("all");
  const [displayCount, setDisplayCount] = useState(20);
  const { members, isLoading } = useCommunityMembers(filter);
  const { stats } = useCommunityStats();

  const displayedMembers = members.slice(0, displayCount);
  const hasMore = displayCount < members.length;

  if (isLoading) {
    return (
      <div className="space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-3 w-1/4 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  return (
    <div className="space-y-4">
      {/* Filters - Standardized Style */}
      <div className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 bg-primary/20 dark:bg-primary/30 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40 w-fit">
        <button
          onClick={() => { setFilter("all"); setDisplayCount(20); }}
          className={cn(
            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
            filter === "all"
              ? "bg-[#0D0D0D] text-white shadow-lg"
              : "text-foreground/70 hover:bg-neutral-800/50"
          )}
        >
          Todos {stats.totalMembers}
        </button>
        <button
          onClick={() => { setFilter("facilitador"); setDisplayCount(20); }}
          className={cn(
            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
            filter === "facilitador"
              ? "bg-[#0D0D0D] text-white shadow-lg"
              : "text-foreground/70 hover:bg-neutral-800/50"
          )}
        >
          Facilitadores {stats.facilitadorCount}
        </button>
        <button
          onClick={() => { setFilter("online"); setDisplayCount(20); }}
          className={cn(
            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
            filter === "online"
              ? "bg-[#0D0D0D] text-white shadow-lg"
              : "text-foreground/70 hover:bg-neutral-800/50"
          )}
        >
          Online {stats.onlineMembers}
        </button>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum membro encontrado
        </div>
      ) : (
        <>
          <div className="divide-y bg-card rounded-xl border overflow-hidden">
            {displayedMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
          
          {/* Show More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleShowMore}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Ver mais membros ({members.length - displayCount} restantes)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
