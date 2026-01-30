import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Partner logos
const partnerLogos = [
  { id: 1, image: "/logos/partners/nubank-logo.png", alt: "Nubank" },
  { id: 2, image: "/logos/partners/raizen-logo.png", alt: "Raízen" },
  { id: 3, image: "/logos/partners/unimed-logo.png", alt: "Unimed" },
  { id: 4, image: "/logos/partners/itau-logo.png", alt: "Itaú" },
  { id: 5, image: "/logos/partners/klabin-logo.png", alt: "Klabin" },
  { id: 6, image: "/logos/partners/coca-cola-logo.png", alt: "Coca-Cola" },
  { id: 7, image: "/logos/partners/usp-logo.png", alt: "USP" },
  { id: 8, image: "/logos/partners/vivo-logo.png", alt: "Vivo" },
  { id: 9, image: "/logos/partners/ifood-logo.png", alt: "iFood" },
  { id: 10, image: "/logos/partners/mercado-livre-logo.png", alt: "Mercado Livre" },
] as const;

// Triplicate for infinite loop
const triplicatedLogos = [...partnerLogos, ...partnerLogos, ...partnerLogos];

function PartnersLogosTicker() {
  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className="flex items-center gap-12"
        animate={{
          translateX: [0, -(partnerLogos.length * 180)]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {triplicatedLogos.map((logo, index) => (
          <div 
            key={`${logo.id}-${index}`}
            className="w-[140px] h-14 flex-shrink-0 flex items-center justify-center"
          >
            {/* Light mode - dark logos */}
            <img 
              src={logo.image} 
              alt={logo.alt}
              loading="lazy"
              decoding="async"
              className="h-10 w-auto max-w-[120px] object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300 dark:hidden"
              onError={(e) => {
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.className = 'text-sm font-medium text-muted-foreground';
                  fallback.textContent = logo.alt;
                  parent.appendChild(fallback);
                }
              }}
            />
            {/* Dark mode - inverted logos */}
            <img 
              src={logo.image} 
              alt={logo.alt}
              loading="lazy"
              decoding="async"
              className="h-10 w-auto max-w-[120px] object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300 hidden dark:block dark:invert"
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

export function AboutSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full flex flex-col items-center justify-center px-4 py-12 md:py-16 lg:py-20">
      <div className="w-full max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block text-sm font-semibold uppercase tracking-widest text-aplicada-green-700 mb-4"
        >
          Sobre
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
        >
          <span className="text-aplicada-green-700 font-bold">IA</span>plicada
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          A IAplicada nasceu da experiência prática em operações complexas de empresas como Mercado Livre, Suzano e AngloGold Ashanti. Depois de anos lidando com rotinas, indicadores e gargalos em negócios líderes em e‑commerce, indústria e mineração, transformamos o que funciona lá fora em uma plataforma acessível para a sua empresa.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            onClick={() => navigate('/servicos')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-full text-base"
          >
            Conheça nossos serviços
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Full-bleed divider + partners ticker (escapa do max-width) */}
        <div className="relative left-1/2 -translate-x-1/2 w-screen max-w-none mt-12">
          <div className="px-4 md:px-8">
            <div className="border-t border-border" />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 px-4 md:px-8 text-center text-sm text-muted-foreground uppercase tracking-wide"
          >
            Empresas que já fazem parte da IAplicada
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6"
          >
            <PartnersLogosTicker />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
