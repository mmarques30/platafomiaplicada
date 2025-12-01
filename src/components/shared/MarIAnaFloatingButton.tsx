import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import logoMariana from "@/assets/logo-mariana-simbolo.png";

export function MarIAnaFloatingButton() {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate("/chat")}
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50 border border-border p-2"
          >
            <img 
              src={logoMariana} 
              alt="MarIAna" 
              className="w-full h-full object-contain"
            />
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