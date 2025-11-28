import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunityMember } from "@/hooks/useCommunityMembers";

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
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-[#9EB038] text-[#2F302B]">
                {getInitials(member.nome_completo)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-green-500 border-2 border-zinc-900 rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-zinc-200 truncate">
                {member.nome_completo}
              </span>
              {member.is_admin && (
                <Badge variant="outline" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Badge variant="secondary" className="text-xs">
                Nível {member.nivel_comunidade}
              </Badge>
              <span>{member.pontos_comunidade} pontos</span>
            </div>

            {member.bio && (
              <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                {member.bio}
              </p>
            )}

            {member.ultimo_acesso && (
              <p className="text-xs text-zinc-600 mt-2">
                Ativo{" "}
                {formatDistanceToNow(new Date(member.ultimo_acesso), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
