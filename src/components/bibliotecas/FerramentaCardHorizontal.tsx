import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Star, Users, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface FerramentaCardHorizontalProps {
  ferramenta: {
    id: string;
    nome: string;
    logo_url: string | null;
    categoria: string;
    objetivo: string;
    avaliacao_mari: number | null;
    avaliacao_comunidade: number | null;
    total_avaliacoes_comunidade: number | null;
    gratuito: boolean;
    vale_a_pena: boolean | null;
    link_ferramenta: string | null;
  };
  onVerMais: () => void;
}

export function FerramentaCardHorizontal({ ferramenta, onVerMais }: FerramentaCardHorizontalProps) {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Logo */}
          <div className="flex-shrink-0">
            {ferramenta.logo_url ? (
              <img
                src={ferramenta.logo_url}
                alt={ferramenta.nome}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {ferramenta.nome.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Informações Principais */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div className="flex-grow">
                <h3 className="text-lg font-bold mb-1">{ferramenta.nome}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {ferramenta.categoria}
                  </Badge>
                  <Badge variant={ferramenta.gratuito ? "secondary" : "default"} className="text-xs">
                    {ferramenta.gratuito ? "Gratuita" : "Paga"}
                  </Badge>
                  {ferramenta.vale_a_pena !== null && (
                    <Badge 
                      variant={ferramenta.vale_a_pena ? "default" : "destructive"}
                      className="text-xs flex items-center gap-1"
                    >
                      {ferramenta.vale_a_pena ? (
                        <><CheckCircle className="w-3 h-3" /> Vale a Pena</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Não Recomendado</>
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ferramenta.objetivo}
                </p>
              </div>

              {/* Avaliações */}
              <div className="flex sm:flex-col gap-3 sm:gap-2 sm:items-end flex-shrink-0">
                {/* Avaliação Mari */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Avaliação Mari</span>
                    <span className="font-bold">{ferramenta.avaliacao_mari || 0}/5</span>
                  </div>
                </div>

                {/* Avaliação Comunidade */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Comunidade</span>
                    <span className="font-bold">
                      {ferramenta.avaliacao_comunidade?.toFixed(1) || "0.0"}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({ferramenta.total_avaliacoes_comunidade || 0})
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 mt-3">
              <FavoriteButton 
                tipo="ferramenta" 
                itemId={ferramenta.id}
                variant="ghost"
                size="sm"
              />
              <Button
                variant="default"
                size="sm"
                onClick={onVerMais}
              >
                Ver Detalhes
              </Button>
              {ferramenta.link_ferramenta && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={ferramenta.link_ferramenta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Acessar
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
