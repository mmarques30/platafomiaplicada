import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/shared/RatingStars";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ExternalLink, CheckCircle, Box } from "lucide-react";

interface FerramentaCardProps {
  ferramenta: {
    id: string;
    nome: string;
    categoria: string;
    objetivo: string;
    logo_url?: string | null;
    gratuito: boolean;
    avaliacao?: number | null;
    vale_a_pena?: boolean | null;
    link_ferramenta?: string | null;
  };
  onVerMais?: () => void;
}

export function FerramentaCard({ ferramenta, onVerMais }: FerramentaCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            {ferramenta.logo_url ? (
              <img 
                src={ferramenta.logo_url} 
                alt={ferramenta.nome}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <Box 
              className="w-6 h-6 text-primary" 
              style={{ display: ferramenta.logo_url ? 'none' : 'flex' }}
            />
          </div>
        </div>

        {/* Nome da Ferramenta */}
        <h3 className="font-bold text-lg text-center line-clamp-1">
          {ferramenta.nome}
        </h3>

        {/* Badges: Categoria + Gratuita */}
        <div className="flex gap-2 justify-center flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {ferramenta.categoria}
          </Badge>
          {ferramenta.gratuito && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 text-xs"
            >
              Gratuita
            </Badge>
          )}
        </div>

        {/* Avaliação */}
        {ferramenta.avaliacao && (
          <div className="flex justify-center">
            <RatingStars rating={ferramenta.avaliacao} size="sm" />
          </div>
        )}

        {/* Objetivo (resumido) */}
        <p className="text-sm text-muted-foreground text-center line-clamp-2 flex-1">
          {ferramenta.objetivo}
        </p>

        {/* Badge "Vale a pena" */}
        {ferramenta.vale_a_pena && (
          <div className="flex items-center justify-center gap-1 text-xs text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Vale a pena!</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 w-full mt-auto">
          <FavoriteButton 
            tipo="ferramenta" 
            itemId={ferramenta.id}
            variant="ghost"
            size="sm"
          />
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={onVerMais}
          >
            Ver Detalhes
          </Button>
          
          {ferramenta.link_ferramenta && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(ferramenta.link_ferramenta!, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
