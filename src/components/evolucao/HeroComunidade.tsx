import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useRankingComunidade } from "@/hooks/useRankingComunidade";
import { useAuth } from "@/hooks/useAuth";

export function HeroComunidade() {
  const { data: ranking } = useRankingComunidade();
  const { user } = useAuth();
  
  const minhaPosicao = ranking?.find((r: any) => r.user_id === user?.id);
  const totalMembros = ranking?.length || 0;
  const meusPontos = minhaPosicao?.pontos_totais || 0;
  const posicao = minhaPosicao?.posicao || 0;

  return (
    <Card className="border-aplicada-green-900/20 bg-aplicada-dark overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Evolução da <span className="text-primary">Comunidade</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Veja como você está em relação aos outros membros
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-aplicada-green-900/30">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-white font-semibold">{totalMembros}</span>
            <span className="text-zinc-400 text-sm">membros</span>
          </div>
        </div>

        {/* Mini Cards de Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
            <span className="text-xs text-white uppercase tracking-wide block mb-2">Sua Posição</span>
            <p className="text-xl font-semibold text-white">
              {posicao > 0 ? `#${posicao}º` : '-'}
            </p>
            <p className="text-xs text-zinc-300">no ranking</p>
          </div>

          <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
            <span className="text-xs text-white uppercase tracking-wide block mb-2">Pontos Totais</span>
            <p className="text-xl font-semibold text-white">{meusPontos.toLocaleString()}</p>
            <p className="text-xs text-zinc-300">XP acumulado</p>
          </div>

          <div className="rounded-lg border border-zinc-600 bg-zinc-700 p-3">
            <span className="text-xs text-white uppercase tracking-wide block mb-2">Comunidade</span>
            <p className="text-xl font-semibold text-white">{totalMembros}</p>
            <p className="text-xs text-zinc-300">membros ativos</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
