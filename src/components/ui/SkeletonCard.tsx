interface SkeletonCardProps {
  variant: "kpi" | "list" | "chart";
  count?: number;
}

function SkeletonItem({ variant }: { variant: SkeletonCardProps["variant"] }) {
  const base = "rounded-xl border border-border bg-card/60 animate-[skeleton-pulse_1.5s_ease-in-out_infinite]";

  if (variant === "kpi") {
    return (
      <div className={`${base} h-[80px] overflow-hidden`}>
        <div className="h-[3px] bg-primary/30 w-full" />
        <div className="flex items-center gap-4 p-4">
          <div className="h-5 w-24 rounded bg-muted/40" />
          <div className="h-7 w-16 rounded bg-muted/40 ml-auto" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={`${base} h-[48px] flex items-center gap-3 px-4`}>
        <div className="h-4 w-2/5 rounded bg-muted/40" />
        <div className="h-4 w-16 rounded bg-muted/40 ml-auto" />
      </div>
    );
  }

  // chart
  return (
    <div className={`${base} h-[200px] p-4`}>
      <div className="h-full w-full rounded-lg bg-muted/40" />
    </div>
  );
}

export function SkeletonCard({ variant, count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonItem key={i} variant={variant} />
      ))}
    </>
  );
}
