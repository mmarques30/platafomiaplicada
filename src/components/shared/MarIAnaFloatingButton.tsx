import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { MarIAnaChatDrawer } from "./MarIAnaChatDrawer";
import mariAvatar from "@/assets/mari-avatar-new.png";
import mariAvatarFallback from "@/assets/mari-avatar.jpg";

// Abertura proativa (não insistente): a MarIAna se mostra sozinha algumas
// vezes por sessão, com bom espaçamento — nunca "a cada minuto".
const PRIMEIRA_ABERTURA_MS = 12_000; // ~12s após entrar
const INTERVALO_REABERTURA_MS = 25 * 60_000; // ~25min entre aberturas proativas
const MAX_ABERTURAS_PROATIVAS = 2; // no máximo 2 vezes por sessão

export function MarIAnaFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const usuarioInteragiuRef = useRef(false);
  const aberturasProativasRef = useRef(0);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Agenda as aberturas proativas, respeitando o teto e o espaçamento.
  useEffect(() => {
    const abrirProativo = () => {
      if (usuarioInteragiuRef.current) return; // usuário já engajou: não incomodar
      if (isOpenRef.current) return; // já está aberta
      if (aberturasProativasRef.current >= MAX_ABERTURAS_PROATIVAS) return;
      aberturasProativasRef.current += 1;
      setIsOpen(true);
    };

    const t1 = setTimeout(abrirProativo, PRIMEIRA_ABERTURA_MS);
    const t2 = setTimeout(abrirProativo, PRIMEIRA_ABERTURA_MS + INTERVALO_REABERTURA_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleOpenManual = () => {
    usuarioInteragiuRef.current = true; // abertura manual desliga as proativas
    setIsOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && <MarIAnaChatDrawer onClose={() => setIsOpen(false)} />}
      </AnimatePresence>

      {!isOpen && (
        <button
          data-tour="mariana-button"
          onClick={handleOpenManual}
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
