import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";
import { useAuth } from "@/hooks/useAuth";
import grafiaEvolucao from "@/assets/grafia-evolucao.svg";

export function HeroComunidade() {
  const { data: ranking } = useRankingComunidade();
  const { user } = useAuth();
  
  const minhaPosicao = ranking?.find((r: any) => r.user_id === user?.id);
  const totalMembros = ranking?.length || 0;
  const meusPontos = minhaPosicao?.total_pontos || 0;
  const posicao = minhaPosicao?.posicao || 0;

  return (
    <Card className="relative overflow-hidden border border-primary/30 bg-card">
      <img 
        src={grafiaEvolucao} 
        alt="" 
        className="absolute bottom-2 right-2 h-16 opacity-20 pointer-events-none" 
      />
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              <span className="text-primary">Ranking</span> IAplicada
            </h2>
            <p className="text-muted-foreground text-lg">
              Veja como você está em relação aos outros membros
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-foreground font-semibold">{totalMembros}</span>
            <span className="text-muted-foreground text-sm">membros</span>
          </div>
        </div>

        {/* Mini Cards de Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-foreground uppercase tracking-wide block mb-2">Sua Posição</span>
            <p className="text-xl font-semibold text-foreground">
              {posicao > 0 ? `#${posicao}º` : '-'}
            </p>
            <p className="text-xs text-muted-foreground">no ranking</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-foreground uppercase tracking-wide block mb-2">Pontos Totais</span>
            <p className="text-xl font-semibold text-foreground">{meusPontos.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">XP acumulado</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-foreground uppercase tracking-wide block mb-2">Comunidade</span>
            <p className="text-xl font-semibold text-foreground">{totalMembros}</p>
            <p className="text-xs text-muted-foreground">membros ativos</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
