import { useState } from "react";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { MemberCard } from "./MemberCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MembersList() {
  const [filter, setFilter] = useState<"all" | "admin" | "online">("all");
  const { members, isLoading } = useCommunityMembers(filter);
  const { stats } = useCommunityStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters - Pill Style */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-full w-fit">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-[#2F302B] text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Membros {stats.totalMembers}
        </button>
        <button
          onClick={() => setFilter("admin")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "admin"
              ? "bg-[#2F302B] text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Admins {stats.adminCount}
        </button>
        <button
          onClick={() => setFilter("online")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "online"
              ? "bg-[#2F302B] text-white"
              : "text-muted-foreground hover:bg-muted"
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
        <div className="divide-y divide-border">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
