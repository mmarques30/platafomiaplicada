import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MarIAnaChatDrawer } from "./MarIAnaChatDrawer";
import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";

/**
 * Botão da MarIAna: símbolo da marca sobre um disco escuro, no canto inferior
 * direito. Só abre quando a pessoa clica, porque a abertura automática
 * atrapalhava mais do que ajudava.
 */
export function MarIAnaFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

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
          className="fixed bottom-4 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card shadow-elevated ring-2 ring-primary/40 transition-transform duration-150 hover:scale-105 md:bottom-6 md:right-6"
        >
          {/* A marca em vetor preenche o botão. O PNG tinha uma margem enorme
              em volta e saía pequeno por mais que se aumentasse a caixa. */}
          <MarcaIAplicada className="h-10 w-10" titulo="Abrir a MarIAna" />
        </button>
      )}
    </>
  );
}
