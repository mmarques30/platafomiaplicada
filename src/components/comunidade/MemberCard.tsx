import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex items-start gap-4 py-6">
      {/* Avatar with Level Badge */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-14 w-14">
          {member.avatar_url && (
            <AvatarImage src={member.avatar_url} alt={member.nome_completo} />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials(member.nome_completo)}
          </AvatarFallback>
        </Avatar>
        {/* Level Badge Overlay */}
        <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground border-2 border-background">
          {member.nivel_comunidade}
        </div>
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        {/* Name + Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground text-base">
            {member.nome_completo}
          </span>
          {member.is_admin && (
            <Badge variant="outline" className="text-xs">
              Admin
            </Badge>
          )}
        </div>

        {/* Plan as subtitle */}
        <p className="text-sm text-muted-foreground">
          @{member.plano_mentoria || "visitante"}
        </p>

        {/* Bio */}
        {member.bio && (
          <p className="text-sm text-foreground mt-1 line-clamp-1">
            {member.bio}
          </p>
        )}

        {/* Status + Join Date */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
          {/* Online Status */}
          <div className="flex items-center gap-1.5">
            <Circle
              className={cn(
                "h-2.5 w-2.5 fill-current",
                isOnline ? "text-green-500" : "text-gray-400"
              )}
            />
            <span className={isOnline ? "text-green-600" : ""}>
              {isOnline ? "Online agora" : "Offline"}
            </span>
          </div>

          {/* Join Date */}
          {member.created_at && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>
                Entrou em{" "}
                {format(new Date(member.created_at), "dd MMM yyyy", {
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
