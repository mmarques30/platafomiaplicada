import { useAuth } from "@/hooks/useAuth";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { TrendingUp, Video, Download, Users, ArrowUp, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function CommunityHeroDashboard() {
  const { user } = useAuth();
  const { data: ranking } = useRankingEngajamento();
  const { stats } = useCommunityStats();

  const myRanking = ranking?.find((r) => r.user_id === user?.id);
  const myPosition = myRanking?.posicao || 0;
  const myPoints = myRanking?.total_pontos || 0;
  const myVideos = myRanking?.total_videos_assistidos || 0;
  const myDownloads = myRanking?.total_materiais_baixados || 0;

  // Calculate progress to next position
  const nextPosition = ranking?.find((r) => r.posicao === myPosition - 1);
  const pointsToNext = nextPosition ? nextPosition.total_pontos - myPoints : 0;
  const progressPercent = nextPosition 
    ? Math.min(100, (myPoints / nextPosition.total_pontos) * 100) 
    : 100;

  // Mock trend (in real app, compare with previous period)
  const positionTrend: number = 2; // Positive = moved up

  return (
    <div className="bg-card rounded-xl border border-primary/20 p-4 sm:p-6 mb-6">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4">Seu Desempenho</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {/* Position */}
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-primary/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Posição</span>
            {positionTrend !== 0 && (
              <span className={`flex items-center text-xs ${positionTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {positionTrend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(positionTrend)}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold">#{myPosition || '-'}</span>
          </div>
        </div>

        {/* Points */}
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Pontos</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold">{myPoints}</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
        </div>

        {/* Videos */}
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Video className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Vídeos</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold">{myVideos}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">assistidos</span>
          </div>
        </div>

        {/* Downloads */}
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Downloads</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold">{myDownloads}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">materiais</span>
          </div>
        </div>
      </div>

      {/* Progress to next position */}
      {nextPosition && pointsToNext > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progresso para #{myPosition - 1}</span>
            <span className="text-primary font-medium">Faltam {pointsToNext} pts</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-muted" />
        </div>
      )}

      {/* Community Stats Footer */}
      <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{stats.totalMembers} membros</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-500">{stats.onlineMembers} online</span>
        </div>
      </div>
    </div>
  );
}
