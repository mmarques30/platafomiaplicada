import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { MemberCard } from "./MemberCard";
import { Skeleton } from "@/components/ui/skeleton";

export function MembersList() {
  const [filter, setFilter] = useState<"all" | "admin" | "online">("all");
  const { members, isLoading } = useCommunityMembers(filter);

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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          Todos
        </Button>
        <Button
          variant={filter === "admin" ? "default" : "outline"}
          onClick={() => setFilter("admin")}
          size="sm"
        >
          Admins
        </Button>
        <Button
          variant={filter === "online" ? "default" : "outline"}
          onClick={() => setFilter("online")}
          size="sm"
        >
          Online
        </Button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum membro encontrado
          </div>
        ) : (
          members.map((member) => <MemberCard key={member.id} member={member} />)
        )}
      </div>
    </div>
  );
}
