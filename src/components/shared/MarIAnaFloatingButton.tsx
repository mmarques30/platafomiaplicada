import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Usar caminho estático com cache-busting para garantir carregamento no PWA
const logoMariana = "/logo-mariana.png?v=10";

export function MarIAnaFloatingButton() {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate("/chat")}
            size="icon"
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 h-11 w-11 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50 border border-border p-2"
          >
            {logoError ? (
              <MessageSquare className="w-5 h-5 md:w-7 md:h-7 text-primary" />
            ) : (
              <img 
                src={logoMariana} 
                alt="MarIAna" 
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-card border-border">
          <p className="font-medium">Fale com a MarIAna</p>
          <p className="text-xs text-muted-foreground">Sua mentora de IA</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}