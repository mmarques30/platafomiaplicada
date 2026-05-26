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

  const statItems = [
    {
      label: "Posição",
      value: `#${myPosition || "-"}`,
      icon: null as null | typeof TrendingUp,
      suffix: null as string | null,
    },
    { label: "Pontos", value: String(myPoints), icon: TrendingUp, suffix: "pts" },
    { label: "Vídeos", value: String(myVideos), icon: Video, suffix: "assistidos" },
    { label: "Downloads", value: String(myDownloads), icon: Download, suffix: "materiais" },
  ];

  return (
    <div className="bg-brand-cream-soft rounded-2xl border border-brand-hairline p-5 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-strong mb-1.5">
            Seu desempenho
          </p>
          <h2 className="font-serif-display text-xl text-foreground leading-tight tracking-tight">
            Sua jornada na comunidade
          </h2>
        </div>
        {positionTrend !== 0 && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${positionTrend > 0 ? "text-brand-strong" : "text-destructive"}`}>
            {positionTrend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(positionTrend)} posições
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {statItems.map((s) => (
          <div key={s.label} className="bg-background rounded-xl p-4 border border-brand-hairline">
            <div className="flex items-center gap-1.5 mb-2">
              {s.icon && <s.icon className="w-3.5 h-3.5 text-brand-strong" />}
              <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{s.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-serif-display text-2xl sm:text-3xl text-foreground tabular-nums leading-none">{s.value}</span>
              {s.suffix && <span className="text-xs text-muted-foreground hidden sm:inline">{s.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Progress to next position */}
      {nextPosition && pointsToNext > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progresso para #{myPosition - 1}</span>
            <span className="text-brand-strong font-medium">Faltam {pointsToNext} pts</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-brand-hairline [&>div]:bg-brand-strong" />
        </div>
      )}

      {/* Community Stats Footer */}
      <div className="flex items-center justify-end gap-4 mt-5 pt-4 border-t border-brand-hairline">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{stats.totalMembers} membros</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2 h-2 rounded-full bg-brand-strong animate-pulse" />
          <span className="text-brand-strong">{stats.onlineMembers} online</span>
        </div>
      </div>
    </div>
  );
}
