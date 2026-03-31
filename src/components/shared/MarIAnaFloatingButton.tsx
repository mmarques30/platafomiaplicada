import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MarIAnaChatDrawer } from "./MarIAnaChatDrawer";
import mariAvatar from "@/assets/mariana-avatar.png";
import mariAvatarFallback from "@/assets/mari-avatar.jpg";

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
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform duration-150 overflow-hidden ring-2 ring-[#AFC040]/50"
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
