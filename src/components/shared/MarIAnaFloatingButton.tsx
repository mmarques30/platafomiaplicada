import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MarIAnaChatDrawer } from "./MarIAnaChatDrawer";

export function MarIAnaFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && <MarIAnaChatDrawer onClose={() => setIsOpen(false)} />}
      </AnimatePresence>

      {!isOpen && (
        <button
          data-tour="mariana-button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 min-w-[110px] h-9 px-4 rounded-[20px] bg-[#AFC040] text-[#0C0F0A] text-[13px] font-medium hover:opacity-[0.88] transition-opacity duration-150"
        >
          ✱ MarIAna
        </button>
      )}
    </>
  );
}
