import { Users } from "lucide-react";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";
import { useAuth } from "@/hooks/useAuth";

export function HeroComunidade() {
  const { data: ranking } = useRankingComunidade();
  const { user } = useAuth();

  const minhaPosicao = ranking?.find((r: any) => r.user_id === user?.id);
  const totalMembros = ranking?.length || 0;
  const meusPontos = minhaPosicao?.total_pontos || 0;
  const posicao = minhaPosicao?.posicao || 0;

  const stats = [
    { label: "Sua posição", value: posicao > 0 ? `${posicao}º` : "-", unit: "no ranking" },
    { label: "Pontos", value: meusPontos.toLocaleString(), unit: "XP acumulado" },
    { label: "Comunidade", value: totalMembros, unit: "membros ativos" },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Comunidade</span>
          <h2 className="font-serif-display text-3xl leading-none text-foreground md:text-4xl">
            Ranking <em className="font-serif-italic text-primary">IAplicada</em>
          </h2>
          <p className="text-sm text-muted-foreground">Veja como você está em relação aos outros membros.</p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-muted px-4 py-2 text-sm">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">{totalMembros}</span>
          <span className="text-muted-foreground">membros</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, unit }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3 md:p-4">
            <span className="block text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px] sm:tracking-[0.12em]">
              {label}
            </span>
            <p className="mt-2 text-2xl font-semibold leading-none text-foreground md:text-3xl">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{unit}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
