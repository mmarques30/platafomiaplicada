import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { MarIAnaChatDrawer } from "./MarIAnaChatDrawer";
import logoMariana from "@/assets/mariana-avatar.png";

export function MarIAnaFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && <MarIAnaChatDrawer onClose={() => setIsOpen(false)} />}
      </AnimatePresence>

      {!isOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="icon"
                className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 h-11 w-11 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-[#0D0D0D] hover:bg-[#1a1a1a] p-2"
              >
                {logoError ? (
                  <MessageSquare className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                ) : (
                  <img
                    src={logoMariana}
                    alt="MarIAna"
                    className="w-full h-full object-cover rounded-full"
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
      )}
    </>
  );
}
