import { motion } from "framer-motion";
import notionLogo from "@/assets/logos/notion-logo.webp";
import claudeLogo from "@/assets/logos/claude-logo.png";
import manusLogo from "@/assets/logos/manus-logo.png";
import lovableLogo from "@/assets/logos/lovable-logo.png";
import gptPilotLogo from "@/assets/logos/gpt-pilot-logo.png";
import chatgptLogo from "@/assets/logos/chatgpt-logo.png";
import tangoLogo from "@/assets/logos/tango-logo.png";

const logos = [
  { id: 1, image: notionLogo, alt: "Notion" },
  { id: 2, image: claudeLogo, alt: "Claude" },
  { id: 3, image: manusLogo, alt: "Manus" },
  { id: 4, image: lovableLogo, alt: "Lovable" },
  { id: 5, image: gptPilotLogo, alt: "GPT Pilot" },
  { id: 6, image: chatgptLogo, alt: "ChatGPT" },
  { id: 7, image: tangoLogo, alt: "Tango" },
] as const;

// Duplicar 3x para loop infinito suave
const triplicatedLogos = [...logos, ...logos, ...logos];

export function LogosTicker() {
  return (
    <div className="max-w-[1224px] mx-auto h-[62px] overflow-hidden">
      <motion.div
        className="flex items-center gap-8"
        animate={{
          translateX: [0, -(logos.length * 160)]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {triplicatedLogos.map((logo, index) => (
          <div 
            key={`${logo.id}-${index}`}
            className="w-[160px] h-11 flex-shrink-0 flex items-center justify-center"
          >
            {/* Logo escura - visível no modo claro */}
            <img 
              src={logo.image} 
              alt={logo.alt}
              className="h-11 w-auto object-contain grayscale brightness-0 dark:hidden"
            />
            {/* Logo clara - visível no modo escuro */}
            <img 
              src={logo.image} 
              alt={logo.alt}
              className="h-11 w-auto object-contain grayscale hidden dark:block dark:invert"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
