import { useDashboardRanking } from "@/hooks/useDashboardRanking";
import { Trophy, PlayCircle, Wrench, TrendingUp, TrendingDown, Star, Minus, FileText, Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RankingTicker() {
  const { data, isLoading } = useDashboardRanking();

  if (isLoading) {
    return (
      <section className="rounded-lg bg-[#E9EBC6] p-2 sm:p-3 shadow-sm">
        <div className="flex items-center justify-center gap-3">
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
  const topPrompt = data?.topPrompts?.[0];
  const topSalvo = data?.topSalvos?.[0];

  return (
    <section className="rounded-lg bg-[#E9EBC6] p-3 sm:p-4 shadow-sm">
      {/* Título */}
      <div className="mb-2 sm:mb-3">
        <h2 className="text-base sm:text-xl md:text-2xl font-bold text-[#0D0D0D]">
          Destaques
        </h2>
      </div>

      {/* Métricas */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        {/* Top Aluno */}
        {topAluno && (
          <RankingItem
            icon={Trophy}
            label={topAluno.nome}
            value={topAluno.totalVideos}
            percentual={topAluno.percentual}
            tendencia={topAluno.tendencia}
          />
        )}

        {/* Separador */}
        {topAula && <div className="h-4 w-px bg-[#0D0D0D]/15 hidden sm:block" />}

        {/* Top Aula */}
        {topAula && (
          <RankingItem
            icon={PlayCircle}
            label={topAula.titulo}
            value={topAula.visualizacoes}
            percentual={topAula.percentual}
            tendencia={topAula.tendencia}
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

        {/* Separador */}
        {topPrompt && <div className="h-4 w-px bg-[#0D0D0D]/15 hidden sm:block" />}

        {/* Top Prompt */}
        {topPrompt && (
          <RankingItem
            icon={FileText}
            label={topPrompt.titulo}
            value={topPrompt.acessos}
            percentual={topPrompt.percentual}
            tendencia={topPrompt.tendencia}
          />
        )}

        {/* Separador */}
        {topSalvo && <div className="h-4 w-px bg-[#0D0D0D]/15 hidden sm:block" />}

        {/* Conteúdo Mais Salvo */}
        {topSalvo && (
          <RankingItem
            icon={Bookmark}
            label={topSalvo.titulo}
            value={topSalvo.salvamentos}
          />
        )}

        {/* Mensagem quando não há dados */}
        {!topAluno && !topAula && !topFerramenta && !topPrompt && !topSalvo && (
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
  value?: number;
  percentual?: number;
  tendencia?: 'up' | 'down' | 'stable';
  stars?: number;
}

function RankingItem({ icon: Icon, label, value, percentual, tendencia, stars }: RankingItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-[#0D0D0D]">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-medium truncate max-w-[100px] sm:max-w-[120px]">
        {label}
      </span>
      
      {stars !== undefined ? (
        <span className="text-xs font-bold flex items-center gap-0.5 text-[#0D0D0D]">
          <Star className="w-3 h-3 fill-current" />
          {stars}
        </span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-[#0D0D0D]">{value}</span>
          
          {tendencia === 'up' && (
            <span className="flex items-center gap-0.5 text-green-600 text-[10px] font-bold">
              <TrendingUp className="w-3 h-3" />
              +{percentual}%
            </span>
          )}
          {tendencia === 'down' && (
            <span className="flex items-center gap-0.5 text-red-500 text-[10px] font-bold">
              <TrendingDown className="w-3 h-3" />
              -{percentual}%
            </span>
          )}
          {tendencia === 'stable' && (
            <span className="flex items-center gap-0.5 text-[#0D0D0D]/50 text-[10px] font-bold">
              <Minus className="w-3 h-3" />
              0%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
