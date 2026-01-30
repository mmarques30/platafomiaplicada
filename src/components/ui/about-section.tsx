import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoIaplicada from "@/assets/logo-iaplicada-icon.png";

export function AboutSection() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col md:flex-row items-center justify-center gap-10 px-4 md:px-8 lg:px-12 py-12 md:py-16">
      {/* Lado Esquerdo - Vídeo/Imagem */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative shadow-2xl shadow-[#9EB038]/40 rounded-2xl overflow-hidden"
      >
        {/* Placeholder - substituir por imagem/vídeo real */}
        <img 
          src="https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?q=80&w=600&h=600&auto=format&fit=crop"
          alt="IAplicada Team"
          className="max-w-md w-full object-cover rounded-2xl"
        />
        
        {/* Botão de Play centralizado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            className="group flex items-center justify-center size-[72px] rounded-full border-2 border-white bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-[#9EB038] hover:border-[#9EB038] hover:scale-110"
            onClick={() => {
              // TODO: Implementar player de vídeo
              console.log("Play video");
            }}
          >
            <Play className="h-6 w-6 text-white fill-white ml-1" />
          </button>
        </div>
      </motion.div>

      {/* Lado Direito - Conteúdo */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="gap-1 max-w-[500px] text-center md:text-left"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center md:justify-start mb-4"
        >
          <img 
            src={logoIaplicada} 
            alt="IAplicada Logo" 
            className="h-12 md:h-14 w-auto"
          />
        </motion.div>

        {/* Título com underline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide inline-block">
            <span className="text-[#9EB038]">IA</span>plicada
          </h2>
          <div className="h-0.5 w-full bg-gradient-to-r from-[#9EB038] to-transparent mt-2" />
        </motion.div>

        {/* Descrição */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-neutral-400 mb-6 leading-relaxed text-sm md:text-base"
        >
          A IAplicada nasceu da experiência prática em operações complexas de empresas como Mercado Livre, Suzano e AngloGold Ashanti. Depois de anos lidando com rotinas, indicadores e gargalos em negócios líderes em e‑commerce, indústria e mineração, transformamos o que funciona lá fora em uma plataforma acessível para a sua empresa.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button 
            onClick={() => navigate('/servicos')}
            className="bg-[#9EB038] hover:bg-[#8EA028] text-white font-medium px-6 py-5 rounded-lg text-sm transition-all duration-300"
          >
            Conheça a IAplicada
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
