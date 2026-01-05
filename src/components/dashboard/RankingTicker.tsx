import { Trophy, PlayCircle, Wrench, TrendingUp, Star } from "lucide-react";
import { useDashboardRanking } from "@/hooks/useDashboardRanking";
import { Skeleton } from "@/components/ui/skeleton";

export function RankingTicker() {
  const { data, isLoading } = useDashboardRanking();

  if (isLoading) {
    return (
      <div className="rounded-xl bg-[#E9EBC6] p-4 md:p-6">
        <Skeleton className="h-6 w-48 mb-4 bg-[#0D0D0D]/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 bg-[#0D0D0D]/10 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const { topAlunos = [], topAulas = [], topFerramentas = [] } = data || {};

  return (
    <section className="rounded-xl bg-[#E9EBC6] p-3 sm:p-4 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <TrendingUp className="w-5 h-5 text-[#0D0D0D]" />
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#0D0D0D] tracking-tight">
          Painel de Destaques
        </h2>
      </div>

      {/* Grid de Rankings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Top Alunos */}
        <RankingColumn
          icon={<Trophy className="w-4 h-4" />}
          title="Top Alunos"
          items={topAlunos.map((a, i) => ({
            position: i + 1,
            label: a.nome,
            value: `${a.totalVideos}`,
            suffix: "▲",
          }))}
          emptyMessage="Sem dados"
        />

        {/* Aulas Populares */}
        <RankingColumn
          icon={<PlayCircle className="w-4 h-4" />}
          title="Aulas Populares"
          items={topAulas.map((a, i) => ({
            position: i + 1,
            label: a.titulo,
            value: `${a.visualizacoes}`,
            suffix: "",
          }))}
          emptyMessage="Sem dados"
        />

        {/* Top Ferramentas */}
        <RankingColumn
          icon={<Wrench className="w-4 h-4" />}
          title="Top Ferramentas"
          items={topFerramentas.map((f, i) => ({
            position: i + 1,
            label: f.nome,
            value: "",
            suffix: "",
            stars: f.avaliacao,
          }))}
          emptyMessage="Sem dados"
          showStars
        />
      </div>
    </section>
  );
}

interface RankingItem {
  position: number;
  label: string;
  value: string;
  suffix?: string;
  stars?: number;
}

interface RankingColumnProps {
  icon: React.ReactNode;
  title: string;
  items: RankingItem[];
  emptyMessage: string;
  showStars?: boolean;
}

function RankingColumn({ icon, title, items, emptyMessage, showStars }: RankingColumnProps) {
  return (
    <div className="bg-[#0D0D0D]/5 rounded-lg p-3 md:p-4">
      {/* Header da coluna */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#0D0D0D]/10">
        <span className="text-[#0D0D0D]">{icon}</span>
        <span className="text-xs sm:text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide">
          {title}
        </span>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-[#0D0D0D]/60 text-center py-2">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.position}
              className="flex items-center justify-between gap-2 text-[#0D0D0D]"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <PositionBadge position={item.position} />
                <span className="text-xs sm:text-sm truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {showStars && item.stars !== undefined ? (
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-[#0D0D0D] text-[#0D0D0D]" />
                    <span className="text-xs font-bold">{item.stars}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm font-bold">{item.value}</span>
                    {item.suffix && (
                      <span className="text-xs text-green-700 font-bold">{item.suffix}</span>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PositionBadge({ position }: { position: number }) {
  const colors: Record<number, string> = {
    1: "bg-yellow-500 text-white",
    2: "bg-gray-400 text-white",
    3: "bg-amber-700 text-white",
  };

  return (
    <span
      className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${
        colors[position] || "bg-[#0D0D0D]/20 text-[#0D0D0D]"
      }`}
    >
      {position}
    </span>
  );
}
