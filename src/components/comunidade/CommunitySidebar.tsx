import { Users, UserCog, Circle, TrendingUp } from "lucide-react";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CommunitySidebar() {
  const { stats } = useCommunityStats();
  const { data: ranking } = useRankingEngajamento();

  const top3 = ranking?.slice(0, 3) || [];

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  return (
    <div className="space-y-4">
      {/* Community Stats */}
      <div className="bg-zinc-800 rounded-2xl p-4">
        <h3 className="text-xl font-bold text-white mb-4">IAplicada Community</h3>
        <p className="text-zinc-400 text-sm mb-4">
          Comunidade de profissionais aplicando IA no dia a dia
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="h-4 w-4" />
              <span className="text-sm">Membros</span>
            </div>
            <span className="text-white font-semibold">{stats.totalMembers}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Circle className="h-3 w-3 text-green-500 fill-green-500" />
              <span className="text-sm">Online</span>
            </div>
            <span className="text-green-500 font-semibold">{stats.onlineMembers}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <UserCog className="h-4 w-4" />
              <span className="text-sm">Admins</span>
            </div>
            <span className="text-white font-semibold">{stats.adminCount}</span>
          </div>
        </div>
      </div>

      {/* Top 3 Leaderboard */}
      <div className="bg-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#9EB038]" />
          <h3 className="text-lg font-bold text-white">Top 3 do Mês</h3>
        </div>
        
        <div className="space-y-3">
          {top3.map((member, index) => (
            <div 
              key={member.user_id} 
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-700/50 transition-colors cursor-pointer"
            >
              <span className={`text-lg font-bold w-6 ${
                index === 0 ? "text-yellow-500" : 
                index === 1 ? "text-zinc-400" : 
                "text-amber-700"
              }`}>
                {index + 1}
              </span>
              <Avatar className="h-10 w-10">
                {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                <AvatarFallback className="bg-zinc-700 text-white text-sm">
                  {getInitials(member.nome_completo)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {member.nome_completo}
                </div>
                <div className="text-xs text-[#9EB038]">
                  {member.total_pontos} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
