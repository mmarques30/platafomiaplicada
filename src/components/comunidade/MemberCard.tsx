import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <Card className="bg-card border-border hover:border-primary/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              {member.avatar_url && (
                <AvatarImage src={member.avatar_url} alt={member.nome_completo} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(member.nome_completo)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <Circle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 fill-green-500 border-2 border-card rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-foreground truncate">
                {member.nome_completo}
              </span>
              {member.is_admin && (
                <Badge variant="outline" className="text-xs">
                  Admin
                </Badge>
              )}
              {member.plano_mentoria && (
                <Badge variant="outline" className="text-xs capitalize">
                  {member.plano_mentoria}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Nível {member.nivel_comunidade}
              </Badge>
              <span>{member.pontos_comunidade} pontos</span>
              {isOnline && (
                <Badge className="bg-green-500 text-white text-xs">
                  Online
                </Badge>
              )}
            </div>

            {member.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {member.bio}
              </p>
            )}

            {member.ultimo_acesso && (
              <p className="text-xs text-muted-foreground mt-2">
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
