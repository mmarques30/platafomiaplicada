import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SimpleVideoPlayer } from "@/components/video/SimpleVideoPlayer";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

export function AboutSection() {
  const navigate = useNavigate();

  const videoUrl = "https://youtu.be/iVC_szCBrnU";
  const videoId = extractYouTubeId(videoUrl) || "";
  const thumbnail = getYouTubeThumbnail(videoId);

  return (
    <section className="px-4 md:px-8 lg:px-12 py-12 md:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center gap-8 md:gap-10">
        {/* Vídeo — grande, centralizado, com autoplay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full overflow-hidden rounded-2xl shadow-2xl shadow-primary/20"
        >
          <SimpleVideoPlayer
            videoId={videoId}
            thumbnail={thumbnail}
            title="IAplicada - Conheça nossa história"
            aspectRatio="video"
            autoplay
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mt-4"
        >
          Sobre · IAplicada
        </motion.p>

        {/* Título serif */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-serif-display text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-foreground -mt-4"
        >
          A IA aplicada{" "}
          <em className="font-serif-italic text-primary">de verdade.</em>
        </motion.h2>

        {/* Descrição */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm md:text-base font-light leading-relaxed text-muted-foreground max-w-prose"
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
          className="mt-2"
        >
          <Button onClick={() => navigate("/auth")} variant="brand-pill" size="pill">
            Conheça a IAplicada
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
