import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Team photos with diagonal layout
const teamPhotos = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop&crop=face",
    alt: "Team member 1",
    rotation: -6,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face",
    alt: "Team member 2",
    rotation: 6,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
    alt: "Team member 3",
    rotation: -6,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&crop=face",
    alt: "Team member 4",
    rotation: 6,
  },
];

// Wavy underline SVG component
function WavyUnderline() {
  return (
    <svg
      className="absolute -bottom-2 left-0 w-full h-3"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
    >
      <path
        d="M0 6 Q 12.5 0, 25 6 T 50 6 T 75 6 T 100 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-aplicada-green-700"
      />
    </svg>
  );
}

export function AboutSection() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16 md:py-24">
      <div className="max-w-5xl mx-auto text-center">
        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block text-sm font-semibold uppercase tracking-widest text-aplicada-green-700 mb-8"
        >
          Sobre
        </motion.span>

        {/* Title with decorative A */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
            <span className="inline-flex items-baseline">
              <span className="relative text-aplicada-green-700 text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mr-2">
                A
                <WavyUnderline />
              </span>
              <span>Legado de Excelência,</span>
            </span>
            <br />
            <span className="block mt-2">Como Nossa Dedicação Move</span>
            <br />
            <span className="block mt-2">Tudo o que Fazemos</span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          A IAplicada nasceu da experiência prática em operações complexas de empresas como Mercado Livre, Suzano e AngloGold Ashanti. Depois de anos lidando com rotinas, indicadores e gargalos em negócios líderes em e‑commerce, indústria e mineração, transformamos o que funciona lá fora em uma plataforma acessível para a sua empresa.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16 md:mb-24"
        >
          <Button 
            onClick={() => navigate('/servicos')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-full text-base"
          >
            Conheça nossos serviços
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Team Photos Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center items-end gap-4 md:gap-6 lg:gap-8"
        >
          {teamPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5 + index * 0.1,
                ease: "easeOut"
              }}
              className="relative group"
              style={{ 
                transform: `rotate(${photo.rotation}deg)`,
                marginTop: index % 2 === 0 ? '0' : '2rem'
              }}
            >
              <div className="w-32 h-40 md:w-40 md:h-52 lg:w-48 lg:h-64 overflow-hidden rounded-2xl bg-muted transition-transform duration-300 group-hover:scale-105">
                <img
                  src={photo.image}
                  alt={photo.alt}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
