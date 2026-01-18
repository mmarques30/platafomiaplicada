import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, ExternalLink } from "lucide-react";

export function MapaAppCard() {
  const handleOpenMapa = () => {
    window.open("https://mapa.iaplicada.com.br", "_blank");
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Esquerda: Ícone + Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Acessar MAPA</h3>
              <p className="text-xs text-muted-foreground">
                Mapeamento de Processos e SOPs
              </p>
            </div>
          </div>
          
          {/* Direita: Botão */}
          <Button size="sm" onClick={handleOpenMapa}>
            Acessar
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
