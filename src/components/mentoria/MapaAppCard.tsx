import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, FileText, Workflow, ExternalLink } from "lucide-react";

export function MapaAppCard() {
  const handleOpenMapa = () => {
    // TODO: Configurar link do MAPA quando disponível
    window.open("https://mapa.iaplicada.com.br", "_blank");
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-accent/5 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Ícone destacado */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Map className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">Acessar MAPA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mapeamento de Processos e Geração Automática de SOPs
            </p>
            
            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <Workflow className="h-3 w-3" />
                <span>Mapeamento</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <FileText className="h-3 w-3" />
                <span>SOPs Automáticos</span>
              </div>
            </div>
            
            <Button 
              onClick={handleOpenMapa}
              className="w-full sm:w-auto"
            >
              Acessar App
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
