import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Linkedin, Award, Users, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Player } from "@/hooks/usePlayers";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleWhatsApp = () => {
    if (player.whatsapp) {
      const phone = player.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}`, "_blank");
    }
  };

  const handleLinkedIn = () => {
    if (player.linkedin) {
      window.open(player.linkedin, "_blank");
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <Avatar className="h-14 w-14">
            {player.avatar_url && (
              <AvatarImage src={player.avatar_url} alt={player.nome_completo} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(player.nome_completo)}
            </AvatarFallback>
          </Avatar>
          {/* Level Badge */}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background">
            {player.nivel_comunidade}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">
              {player.nome_completo}
            </span>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              <Award className="w-3 h-3 mr-1" />
              Player
            </Badge>
          </div>

          {player.especialidade && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {player.especialidade}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{player.total_indicacoes} indicações</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                Desde {format(new Date(player.data_player), "MMM yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {player.apresentacao && (
        <p className="text-sm text-foreground/80 mt-3 line-clamp-2">
          "{player.apresentacao}"
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        {player.whatsapp && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsApp}
            className="flex-1 gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        )}
        {player.linkedin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkedIn}
            className="flex-1 gap-2"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
        )}
      </div>
    </div>
  );
}
