import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Sparkles, ChevronRight, Cpu } from "lucide-react";

interface IACopieUseRowProps {
  ia: {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    ia_recomendada?: string | null;
  };
  onClick: () => void;
}

export function IACopieUseRow({ ia, onClick }: IACopieUseRowProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="font-semibold text-foreground truncate">{ia.titulo}</h3>
        <p className="text-sm text-muted-foreground truncate">{ia.descricao}</p>
      </div>
      
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <Badge variant="secondary">{ia.categoria}</Badge>
        {ia.ia_recomendada && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            {ia.ia_recomendada}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <FavoriteButton 
          tipo="ia_copie_use" 
          itemId={ia.id}
          variant="icon-only"
          size="sm"
        />
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Ver
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
