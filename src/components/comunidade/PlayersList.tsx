import { usePlayers } from "@/hooks/usePlayers";
import { PlayerCard } from "./PlayerCard";
import { Skeleton } from "@/components/ui/skeleton";

export function PlayersList() {
  const { players, isLoading } = usePlayers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Foco na Função */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-amber-500">
              Players
            </h2>
            <p className="text-foreground/80 mt-2 leading-relaxed">
              Os Players são membros ativos que facilitam a troca de conhecimento na comunidade. 
              Eles atuam como pontes entre os participantes, ajudando a resolver dúvidas, 
              compartilhar experiências e conectar pessoas com interesses em comum.
            </p>
          </div>
          
          {/* Função do Player */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-amber-400 uppercase tracking-wide">
              O que um Player faz:
            </h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Responde dúvidas de outros membros da comunidade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Compartilha cases e experiências práticas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Indica novos membros interessados em IA</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Participa ativamente das discussões e eventos</span>
              </li>
            </ul>
          </div>

          {/* Benefícios */}
          <div className="pt-4 border-t border-amber-500/20">
            <h3 className="font-semibold text-sm text-amber-400 uppercase tracking-wide">
              Benefícios:
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Comissão por indicações convertidas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Badge exclusivo no perfil</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Acesso antecipado a novos conteúdos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">-</span>
                <span>Participação em grupo exclusivo de Players</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {players.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <h3 className="text-lg font-medium text-amber-500">
            Ainda não temos Players
          </h3>
          <p className="text-muted-foreground mt-2">
            Em breve teremos facilitadores para ajudar a comunidade.
          </p>
        </div>
      )}
    </div>
  );
}
