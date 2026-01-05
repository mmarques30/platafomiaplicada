import { motion } from "framer-motion";

// Usar caminhos estáticos para garantir carregamento no PWA
const logos = [
  { id: 1, image: "/logos/notion-logo.png", alt: "Notion" },
  { id: 2, image: "/logos/claude-logo.png", alt: "Claude" },
  { id: 3, image: "/logos/manus-logo.png", alt: "Manus" },
  { id: 4, image: "/logos/lovable-logo.png", alt: "Lovable" },
  { id: 5, image: "/logos/gpt-pilot-logo.png", alt: "GPT Pilot" },
  { id: 6, image: "/logos/chatgpt-logo.png", alt: "ChatGPT" },
  { id: 7, image: "/logos/tango-logo.png", alt: "Tango" },
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
              loading="lazy"
              decoding="async"
              className="h-11 w-auto object-contain grayscale brightness-0 dark:hidden"
              onError={(e) => {
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  e.currentTarget.style.display = 'none';
                  // Mostrar nome da ferramenta como fallback
                  const fallback = document.createElement('span');
                  fallback.className = 'text-sm font-medium text-muted-foreground';
                  fallback.textContent = logo.alt;
                  parent.appendChild(fallback);
                }
              }}
            />
            {/* Logo clara - visível no modo escuro */}
            <img 
              src={logo.image} 
              alt={logo.alt}
              loading="lazy"
              decoding="async"
              className="h-11 w-auto object-contain grayscale hidden dark:block dark:invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
