import { useState } from "react";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { MemberCard } from "./MemberCard";
import { cn } from "@/lib/utils";
import { Users, Wifi, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MembersList() {
  const [filter, setFilter] = useState<"all" | "admin" | "online">("all");
  const [displayCount, setDisplayCount] = useState(20);
  const { members, isLoading } = useCommunityMembers(filter);
  const { stats } = useCommunityStats();

  const displayedMembers = members.slice(0, displayCount);
  const hasMore = displayCount < members.length;

  if (isLoading) {
    return (
      <div className="space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-border p-4 animate-pulse">
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
      {/* Stats Cards - Horizontal */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats.totalMembers}</p>
            <p className="text-xs text-muted-foreground">Membros</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Wifi className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{stats.onlineMembers}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{stats.adminCount}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
        </div>
      </div>

      {/* Filters - Pill Style */}
      <div className="flex items-center gap-2 p-1 bg-muted rounded-full w-fit">
        <button
          onClick={() => { setFilter("all"); setDisplayCount(20); }}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          )}
        >
          Todos {stats.totalMembers}
        </button>
        <button
          onClick={() => { setFilter("admin"); setDisplayCount(20); }}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "admin"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          )}
        >
          Admins {stats.adminCount}
        </button>
        <button
          onClick={() => { setFilter("online"); setDisplayCount(20); }}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            filter === "online"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
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
          <div className="divide-y divide-border">
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
