import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { FavoriteButton } from "@/components/shared/FavoriteButton";

interface IACopieUseCardProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    ia_recomendada?: string | null;
  };
  onClick: () => void;
}

export function IACopieUseCard({ ia, onClick }: IACopieUseCardProps) {
  return (
    <Card 
      className="min-h-[220px] hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-primary/50 relative group"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full">
        {/* Favorite button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton tipo="ia_copie_use" itemId={ia.id} variant="icon-only" size="sm" />
        </div>

        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-3 mb-2">{ia.titulo}</h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-auto">{ia.descricao}</p>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary" className="text-xs">
            {ia.categoria}
          </Badge>
          {ia.ia_recomendada && (
            <Badge variant="outline" className="text-xs">
              {ia.ia_recomendada}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
