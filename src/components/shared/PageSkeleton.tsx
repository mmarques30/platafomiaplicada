
const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
);

const SkeletonCard = ({ className = "", children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`animate-pulse rounded-xl bg-zinc-900/50 border border-white/5 ${className}`}>{children}</div>
);

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-2">
      <main className="container py-3 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6">
        {/* Welcome header */}
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-5 w-48" />
        </div>
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border border-border bg-card/60 animate-[skeleton-pulse_1.5s_ease-in-out_infinite] h-[80px] overflow-hidden">
              <div className="h-[3px] bg-primary/30 w-full" />
              <div className="flex items-center gap-4 p-4">
                <div className="h-5 w-24 rounded bg-muted/40" />
                <div className="h-7 w-16 rounded bg-muted/40 ml-auto" />
              </div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="rounded-xl border border-border bg-card/60 animate-[skeleton-pulse_1.5s_ease-in-out_infinite] h-[200px] p-4">
          <div className="h-full w-full rounded-lg bg-muted/40" />
        </div>
        {/* Ranking ticker */}
        <SkeletonCard className="h-16" />
        {/* Novidades */}
        <SkeletonCard className="h-[200px]" />
      </main>
    </div>
  );
}

function TrilhasSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-4 md:py-6 px-4 space-y-6">
        <SkeletonBlock className="h-9 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} className="h-[220px] p-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-[100px] rounded-lg bg-white/10" />
                <SkeletonBlock className="h-5 w-3/4 bg-white/10" />
                <SkeletonBlock className="h-4 w-1/2 bg-white/10" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </main>
    </div>
  );
}

function CalendarioSkeleton() {
  return (
    <div className="space-y-6">
      {/* Próxima aula card */}
      <SkeletonCard className="h-[160px] p-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-28 bg-white/10" />
          <SkeletonBlock className="h-7 w-64 bg-white/10" />
          <SkeletonBlock className="h-4 w-48 bg-white/10" />
        </div>
      </SkeletonCard>
      {/* Lista de aulas */}
      <SkeletonCard className="p-6">
        <div className="space-y-4">
          <SkeletonBlock className="h-5 w-32 bg-white/10" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="space-y-2 flex-1">
                <SkeletonBlock className="h-5 w-48 bg-white/10" />
                <SkeletonBlock className="h-4 w-32 bg-white/10" />
              </div>
              <SkeletonBlock className="h-8 w-16 bg-white/10" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

function EvolucaoSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <SkeletonBlock className="h-9 w-48" />
      {/* Tabs */}
      <SkeletonBlock className="h-12 w-full md:w-80 rounded-xl" />
      {/* Hero */}
      <SkeletonCard className="h-[200px] p-6">
        <div className="space-y-4">
          <SkeletonBlock className="h-6 w-40 bg-white/10" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <SkeletonBlock key={i} className="h-20 rounded-lg bg-white/10" />
            ))}
          </div>
        </div>
      </SkeletonCard>
      {/* Trilhas cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <SkeletonCard key={i} className="h-[140px]" />
        ))}
      </div>
    </div>
  );
}

interface PageSkeletonProps {
  variant: "dashboard" | "trilhas" | "calendario" | "evolucao";
}

export function PageSkeleton({ variant }: PageSkeletonProps) {
  switch (variant) {
    case "dashboard": return <DashboardSkeleton />;
    case "trilhas": return <TrilhasSkeleton />;
    case "calendario": return <CalendarioSkeleton />;
    case "evolucao": return <EvolucaoSkeleton />;
  }
}
