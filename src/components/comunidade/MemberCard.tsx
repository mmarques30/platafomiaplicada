import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Circle, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunityMember } from "@/hooks/useCommunityMembers";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: CommunityMember;
}

export function MemberCard({ member }: MemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const isOnline =
    member.ultimo_acesso &&
    new Date(member.ultimo_acesso) >
      new Date(Date.now() - 5 * 60 * 1000);

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer">
      {/* Avatar with Level Badge */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          {member.avatar_url && (
            <AvatarImage src={member.avatar_url} alt={member.nome_completo} />
          )}
          <AvatarFallback className="bg-[#9EB038] text-white">
            {getInitials(member.nome_completo)}
          </AvatarFallback>
        </Avatar>
        {/* Level Badge Overlay */}
        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-900">
          {member.nivel_comunidade}
        </div>
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        {/* Name + Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white">
            {member.nome_completo}
          </span>
          {member.is_admin && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#9EB038]/20 text-[#9EB038]">
              Admin
            </span>
          )}
        </div>

        {/* Plan as subtitle */}
        <p className="text-sm text-zinc-500">
          @{member.plano_mentoria || "visitante"}
        </p>

        {/* Bio */}
        {member.bio && (
          <p className="text-sm text-zinc-300 mt-1 line-clamp-1">
            {member.bio}
          </p>
        )}

        {/* Status + Join Date */}
        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 flex-wrap">
          {/* Online Status */}
          <div className="flex items-center gap-1.5">
            <Circle
              className={cn(
                "h-2 w-2 fill-current",
                isOnline ? "text-green-500" : "text-zinc-600"
              )}
            />
            <span className={isOnline ? "text-green-500" : ""}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Join Date */}
          {member.created_at && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                {format(new Date(member.created_at), "MMM yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
