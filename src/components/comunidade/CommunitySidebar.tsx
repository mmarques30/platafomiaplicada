import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCog, Circle, BookOpen, Wrench, Lightbulb } from "lucide-react";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";

export function CommunitySidebar() {
  const { stats } = useCommunityStats();
  const { data: ranking } = useRankingComunidade();

  const top3 = ranking?.slice(0, 3) || [];

  return (
    <div className="space-y-4">
      {/* Community Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">IAplicada Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Comunidade de profissionais aplicando IA no dia a dia
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Membros</span>
              </div>
              <Badge variant="secondary">{stats.totalMembers}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-green-500 fill-green-500" />
                <span className="text-foreground">Online</span>
              </div>
              <Badge variant="secondary">{stats.onlineMembers}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Admins</span>
              </div>
              <Badge variant="secondary">{stats.adminCount}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Leaderboard */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Top 3 (30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {top3.map((member, index) => (
            <div key={member.user_id} className="flex items-center gap-3">
              <div className="text-lg font-bold text-muted-foreground w-6">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {member.nome_completo}
                </div>
                <div className="text-xs text-muted-foreground">
                  {member.pontos_comunidade} pontos
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/trilhas" className="text-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Academy
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/biblioteca-ferramentas" className="text-sm">
              <Wrench className="h-4 w-4 mr-2" />
              Ferramentas IA
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/biblioteca-prompts" className="text-sm">
              <Lightbulb className="h-4 w-4 mr-2" />
              Biblioteca de Prompts
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
