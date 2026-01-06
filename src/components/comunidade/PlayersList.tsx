import { usePlayers } from "@/hooks/usePlayers";
import { PlayerCard } from "./PlayerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Gamepad2, Sparkles, ArrowRight } from "lucide-react";

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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 rounded-lg">
            <Gamepad2 className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Players - Facilitadores da Comunidade
              <Sparkles className="h-5 w-5 text-amber-500" />
            </h2>
            <p className="text-muted-foreground mt-1">
              Os Players são membros especiais que ajudam a comunidade a crescer. 
              Eles podem te orientar, responder dúvidas e indicar novos membros!
            </p>
            
            <div className="mt-4 p-3 bg-background/50 rounded-md border">
              <h3 className="font-medium text-sm text-foreground">Benefícios de ser um Player:</h3>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li>• Comissão por indicações convertidas</li>
                <li>• Badge exclusivo no perfil</li>
                <li>• Acesso antecipado a novos conteúdos</li>
                <li>• Participação em grupo exclusivo</li>
              </ul>
            </div>

            <Button variant="outline" size="sm" className="mt-4 gap-2">
              Quer ser um Player? Saiba mais
              <ArrowRight className="h-4 w-4" />
            </Button>
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
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Ainda não temos Players
          </h3>
          <p className="text-muted-foreground mt-1">
            Em breve teremos facilitadores para ajudar a comunidade!
          </p>
        </div>
      )}
    </div>
  );
}
