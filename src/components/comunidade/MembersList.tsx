import { useState } from "react";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { MemberCard } from "./MemberCard";
import { cn } from "@/lib/utils";

export function MembersList() {
  const [filter, setFilter] = useState<"all" | "admin" | "online">("all");
  const { members, isLoading } = useCommunityMembers(filter);
  const { stats } = useCommunityStats();

  if (isLoading) {
    return (
      <div className="space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-zinc-800 p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-zinc-800 rounded" />
                <div className="h-3 w-1/4 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters - Pill Style */}
      <div className="flex items-center gap-2 p-1 bg-zinc-800 rounded-full w-fit">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-[#9EB038] text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-700"
          )}
        >
          Todos {stats.totalMembers}
        </button>
        <button
          onClick={() => setFilter("admin")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "admin"
              ? "bg-[#9EB038] text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-700"
          )}
        >
          Admins {stats.adminCount}
        </button>
        <button
          onClick={() => setFilter("online")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "online"
              ? "bg-[#9EB038] text-white"
              : "text-zinc-400 hover:text-white hover:bg-zinc-700"
          )}
        >
          Online {stats.onlineMembers}
        </button>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          Nenhum membro encontrado
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
