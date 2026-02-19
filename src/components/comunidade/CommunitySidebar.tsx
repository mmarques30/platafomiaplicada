import { Trophy, Users, Crown, Medal, Gift } from "lucide-react";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CommunitySidebar() {
  const { data: ranking } = useRankingEngajamento();
  const { stats } = useCommunityStats();

  const top3 = ranking?.slice(0, 3) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (position === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (position === 3) return <Medal className="w-4 h-4 text-amber-700" />;
    return null;
  };

  const getMedalBg = (position: number) => {
    if (position === 1) return "bg-yellow-500/10 border-yellow-500/30";
    if (position === 2) return "bg-gray-400/10 border-gray-400/30";
    if (position === 3) return "bg-amber-700/10 border-amber-700/30";
    return "bg-neutral-800 border-neutral-700";
  };

  return (
    <div className="sticky top-6 space-y-4">
      {/* Top 3 Card */}
      <div className="bg-card rounded-xl border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Top 3 do Mês</h3>
        </div>

        <div className="space-y-3">
          {top3.map((member, index) => (
            <div 
              key={member.user_id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${getMedalBg(index + 1)}`}
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {getInitials(member.nome_completo)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  {getMedalIcon(index + 1)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.nome_completo.split(" ")[0]}
                </p>
                <p className="text-xs text-primary">{member.total_pontos} pts</p>
              </div>
              <span className="text-lg font-bold text-muted-foreground">
                #{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Stats Card */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Comunidade</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total de membros</span>
            <span className="text-sm font-semibold">{stats.totalMembers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Online agora</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-green-500">{stats.onlineMembers}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Facilitadores</span>
            <span className="text-sm font-semibold">{stats.facilitadorCount}</span>
          </div>
        </div>
      </div>

      {/* Card de Premiação */}
      <div className="bg-card rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Premiação Mensal</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          Todo mês, o membro mais engajado é premiado com acesso especial ou sessões de mentoria exclusivas.
        </p>
        
        <div className="bg-[#E9EBC6]/30 rounded-lg p-3">
          <p className="text-xs font-medium text-[#0D0D0D]/80 mb-2">
            Como pontuar:
          </p>
          <div className="space-y-1.5 text-xs text-[#0D0D0D]/60">
            <div className="flex justify-between">
              <span>Aula presencial</span>
              <span className="font-semibold text-[#0D0D0D]/80">25pts</span>
            </div>
            <div className="flex justify-between">
              <span>Assistir vídeo</span>
              <span className="font-semibold text-[#0D0D0D]/80">10pts</span>
            </div>
            <div className="flex justify-between">
              <span>Baixar material</span>
              <span className="font-semibold text-[#0D0D0D]/80">5pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
