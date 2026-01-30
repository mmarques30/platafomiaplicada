import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoIaplicada from "@/assets/logo-iaplicada.png";

export function AboutSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full flex items-center justify-center px-4 py-12 md:py-16 lg:py-20">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Lado Esquerdo - Vídeo/Imagem */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2"
        >
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl shadow-[#9EB038]/40">
            {/* Placeholder - substituir pelo vídeo real */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2c28] to-[#1a1c19]">
              {/* Padrão decorativo de fundo */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#9EB038]/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#9EB038]/20 rounded-full blur-3xl" />
              </div>
            </div>
            
            {/* Botão de Play centralizado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className="group flex items-center justify-center size-20 rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-[#9EB038] hover:border-[#9EB038] hover:scale-110"
                onClick={() => {
                  // TODO: Implementar player de vídeo quando o arquivo estiver disponível
                  console.log("Play video");
                }}
              >
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </button>
            </div>

            {/* Texto indicativo - remover quando tiver vídeo real */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white/60 text-sm">
                Faça upload do vídeo em public/videos/
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lado Direito - Conteúdo */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full lg:w-1/2 text-center lg:text-left"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center lg:justify-start mb-6"
          >
            <img 
              src={logoIaplicada} 
              alt="IAplicada Logo" 
              className="h-14 md:h-16 w-auto"
            />
          </motion.div>

          {/* Título */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            <span className="text-[#9EB038] font-bold">IA</span>plicada
          </motion.h2>

          {/* Barra de destaque */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="h-1 w-20 bg-gradient-to-r from-[#9EB038] to-[#9EB038]/30 mb-6 mx-auto lg:mx-0 origin-left"
          />

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg text-neutral-400 mb-8 leading-relaxed"
          >
            A IAplicada nasceu da experiência prática em operações complexas de empresas como Mercado Livre, Suzano e AngloGold Ashanti. Depois de anos lidando com rotinas, indicadores e gargalos em negócios líderes em e‑commerce, indústria e mineração, transformamos o que funciona lá fora em uma plataforma acessível para a sua empresa.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button 
              onClick={() => navigate('/servicos')}
              className="bg-gradient-to-r from-[#9EB038] to-[#7A8A2A] hover:from-[#8EA028] hover:to-[#6A7A1A] text-white font-semibold px-8 py-6 rounded-full text-base shadow-lg shadow-[#9EB038]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#9EB038]/30"
            >
              Conheça a IAplicada
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
