import { useAuth } from "@/hooks/useAuth";
import { useRankingEngajamento } from "@/hooks/useRankingEngajamento";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { Users } from "lucide-react";

export function CommunityHeroDashboard() {
  const { user } = useAuth();
  const { data: ranking } = useRankingEngajamento();
  const { stats } = useCommunityStats();

  const myRanking = ranking?.find((r) => r.user_id === user?.id);
  const myPosition = myRanking?.posicao || 0;
  const myPoints = myRanking?.total_pontos || 0;
  const myVideos = myRanking?.total_videos_assistidos || 0;
  const myDownloads = myRanking?.total_materiais_baixados || 0;

  const chips = [
    { label: "Posição", value: myPosition ? `#${myPosition}` : "#-" },
    { label: "Pontos", value: String(myPoints) },
    { label: "Vídeos", value: String(myVideos) },
    { label: "Downloads", value: String(myDownloads) },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-strong via-brand-strong to-[#39450f] text-brand-cream p-6 sm:p-8">
      {/* Marca d'água do símbolo da marca */}
      <div
        className="absolute -right-12 -top-12 w-72 h-72 opacity-[0.10] bg-no-repeat bg-contain pointer-events-none"
        style={{ backgroundImage: "url(/background-symbol-soft.png)" }}
      />

      <div className="relative">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-cream/60 mb-2">
          ✺ Comunidade
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl leading-[1.05] tracking-tight">
          Comunidade{" "}
          <em className="font-serif-italic text-[#cdd98a]">aplicada</em>
        </h1>
        <p className="text-sm text-brand-cream/70 mt-2 max-w-md">
          Quem está aplicando IA na rotina, ao vivo.
        </p>

        {/* Stats inline em chips translúcidos */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6">
          {chips.map((c) => (
            <div
              key={c.label}
              className="flex items-baseline gap-1.5 rounded-full bg-brand-cream/10 border border-brand-cream/15 px-3.5 py-1.5 backdrop-blur-sm"
            >
              <span className="font-serif-display text-lg leading-none tabular-nums">{c.value}</span>
              <span className="text-[10px] text-brand-cream/60 uppercase tracking-[0.08em]">{c.label}</span>
            </div>
          ))}

          <div className="flex items-center gap-3 sm:ml-auto text-xs text-brand-cream/75">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {stats.totalMembers} membros
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#cdd98a] animate-pulse" />
              {stats.onlineMembers} online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
