import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoIaplicada from "@/assets/logo-iaplicada-icon.png";
import { SimpleVideoPlayer } from "@/components/video/SimpleVideoPlayer";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export function AboutSection() {
  const navigate = useNavigate();

  const videoUrl = "https://youtu.be/iVC_szCBrnU";
  const videoId = extractYouTubeId(videoUrl) || "";
  const thumbnail = getYouTubeThumbnail(videoId);

  return (
    <section className="px-4 md:px-8 lg:px-12 py-12 md:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Lado Esquerdo - Vídeo Horizontal 16:9 (mais espaço em desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 w-full overflow-hidden rounded-2xl shadow-2xl shadow-primary/30"
        >
          <SimpleVideoPlayer
            videoId={videoId}
            thumbnail={thumbnail}
            title="IAplicada - Conheça nossa história"
            aspectRatio="video"
          />
        </motion.div>

        {/* Lado Direito - Texto */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-5 text-center lg:text-left"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center lg:justify-start mb-4"
          >
            <img
              src={logoIaplicada}
              alt="IAplicada Logo"
              className="h-14 md:h-16 w-auto"
            />
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50 mb-3"
          >
            Sobre · IAplicada
          </motion.p>

          {/* Título serif */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-serif-display text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-white mb-5"
          >
            A IA aplicada{" "}
            <em className="font-serif-italic text-primary">de verdade.</em>
          </motion.h2>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm md:text-base font-light leading-relaxed text-white/70 mb-8 max-w-prose mx-auto lg:mx-0"
          >
            A IAplicada nasceu da experiência prática em operações complexas de empresas como
            Mercado Livre, Suzano e AngloGold Ashanti. Depois de anos lidando com rotinas,
            indicadores e gargalos em negócios líderes em e‑commerce, indústria e mineração,
            transformamos o que funciona lá fora em um ecossistema completo, pra sua carreira,
            time e empresa.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              onClick={() => navigate("/servicos")}
              variant="brand-pill"
              size="pill"
            >
              Conheça a IAplicada
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
