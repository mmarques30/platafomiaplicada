import { useState } from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { MarIAnaChatDrawer } from "./MarIAnaChatDrawer";
import mariAvatar from "@/assets/mari-avatar-new.png";
import mariAvatarFallback from "@/assets/mari-avatar.jpg";

/**
 * Botão da MarIAna. Fica à esquerda, longe da coluna de conteúdo, e só abre
 * quando a pessoa clica: a abertura automática atrapalhava mais do que ajudava.
 */
export function MarIAnaFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  /* No desktop o botão se encosta na borda da sidebar em vez de cobri-la. */
  const { state } = useSidebar();
  const recuado = state === "expanded";

  const handleOpenManual = () => setIsOpen(true);

  return (
    <>
      <AnimatePresence>
        {isOpen && <MarIAnaChatDrawer onClose={() => setIsOpen(false)} />}
      </AnimatePresence>

      {!isOpen && (
        <button
          data-tour="mariana-button"
          onClick={handleOpenManual}
          className={cn(
            "fixed bottom-4 left-4 z-50 h-14 w-14 overflow-hidden rounded-full shadow-elevated ring-2 ring-primary/50",
            "transition-all duration-200 hover:scale-105 md:bottom-6",
            recuado ? "md:left-[17rem]" : "md:left-[4.25rem]",
          )}
        >
          <img
            src={mariAvatar}
            alt="MarIAna"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = mariAvatarFallback; }}
          />
        </button>
      )}
    </>
  );
}
