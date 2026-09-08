import { useCommunityStatsGratuito } from "@/hooks/useCommunityStatsGratuito";
import { Users, UserCheck, FileText, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RankingTickerGratuito() {
  const { data, isLoading } = useCommunityStatsGratuito();

  if (isLoading) {
    return (
      <section className="rounded-lg bg-card border border-border p-2 sm:p-3 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-4 w-32 bg-muted" />
          <Skeleton className="h-4 w-28 bg-muted" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-card border border-border p-3 sm:p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        {/* Total Visitantes */}
        <StatItem
          icon={Users}
          label="Visitantes"
          value={data?.total_visitantes ?? 0}
        />

        {/* Separador */}
        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* Online Agora */}
        <StatItem
          icon={UserCheck}
          label="Online agora"
          value={data?.online_visitantes ?? 0}
          highlight={true}
        />

        {/* Separador */}
        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* Vídeos Assistidos */}
        <StatItem
          icon={Video}
          label="Vídeos assistidos"
          value={data?.total_videos_assistidos ?? 0}
        />

        {/* Separador */}
        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* Materiais Baixados */}
        <StatItem
          icon={FileText}
          label="Downloads"
          value={data?.total_materiais_baixados ?? 0}
        />
      </div>
    </section>
  );
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  highlight?: boolean;
}

function StatItem({ icon: Icon, label, value, highlight }: StatItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-foreground">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-xs font-medium truncate max-w-[100px] sm:max-w-[120px]">
        {label}
      </span>
      <span className={`text-xs font-bold ${highlight ? 'text-green-600' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}
