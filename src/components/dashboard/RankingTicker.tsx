import { useDashboardRanking } from "@/hooks/useDashboardRanking";
import { Trophy, PlayCircle, Wrench, TrendingUp, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RankingTicker() {
  const { data, isLoading } = useDashboardRanking();

  if (isLoading) {
    return (
      <section className="rounded-lg bg-[#E9EBC6] p-2 sm:p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24 bg-[#0D0D0D]/10" />
          <Skeleton className="h-4 w-32 bg-[#0D0D0D]/10" />
          <Skeleton className="h-4 w-28 bg-[#0D0D0D]/10" />
        </div>
      </section>
    );
  }

  const topAluno = data?.topAlunos[0];
  const topAula = data?.topAulas[0];
  const topFerramenta = data?.topFerramentas[0];

  return (
    <section className="rounded-lg bg-[#E9EBC6] p-2 sm:p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        {/* Título */}
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#0D0D0D]" />
          <span className="text-xs font-bold text-[#0D0D0D] uppercase tracking-wide">
            Destaques
          </span>
        </div>

        {/* Separador */}
        <div className="h-4 w-px bg-[#0D0D0D]/20 hidden sm:block" />

        {/* Top Aluno */}
        {topAluno && (
          <RankingItem
            icon={Trophy}
            label={topAluno.nome}
            value={`${topAluno.totalVideos}▲`}
          />
        )}

        {/* Separador */}
        {topAula && <div className="h-4 w-px bg-[#0D0D0D]/15 hidden sm:block" />}

        {/* Top Aula */}
        {topAula && (
          <RankingItem
            icon={PlayCircle}
            label={topAula.titulo}
            value={String(topAula.visualizacoes)}
          />
        )}

        {/* Separador */}
        {topFerramenta && <div className="h-4 w-px bg-[#0D0D0D]/15 hidden sm:block" />}

        {/* Top Ferramenta */}
        {topFerramenta && (
          <RankingItem
            icon={Wrench}
            label={topFerramenta.nome}
            stars={topFerramenta.avaliacao}
          />
        )}

        {/* Mensagem quando não há dados */}
        {!topAluno && !topAula && !topFerramenta && (
          <span className="text-xs text-[#0D0D0D]/60">
            Nenhum destaque disponível ainda
          </span>
        )}
      </div>
    </section>
  );
}

interface RankingItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  stars?: number;
}

function RankingItem({ icon: Icon, label, value, stars }: RankingItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-[#0D0D0D]">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-medium truncate max-w-[120px] sm:max-w-[150px]">
        {label}
      </span>
      {stars !== undefined ? (
        <span className="text-xs font-bold flex items-center gap-0.5 text-[#0D0D0D]">
          <Star className="w-3 h-3 fill-current" />
          {stars}
        </span>
      ) : (
        <span className="text-xs font-bold text-[#0D0D0D]">{value}</span>
      )}
    </div>
  );
}
