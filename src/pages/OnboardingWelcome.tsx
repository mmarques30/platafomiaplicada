import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const logoMariana = "/logo-mariana.png?v=10";

const environmentMap: Record<string, { name: string; description: string }> = {
  desenvolver_habilidades_ia: {
    name: "Academy",
    description: "trilhas completas de IA com vídeos, exercícios e projetos práticos",
  },
  melhorar_produtividade_time: {
    name: "Skills",
    description: "capacitação de equipes com diagnóstico e roadmap personalizado",
  },
  organizar_operacao: {
    name: "Business",
    description: "consultoria estratégica com implementação de IA na sua operação",
  },
  explorando: {
    name: "Gratuito",
    description: "conteúdos gratuitos para você explorar o poder da IA",
  },
};

export default function OnboardingWelcome() {
  const navigate = useNavigate();

  const nome = sessionStorage.getItem("onboarding_nome") || "visitante";
  const objetivo = sessionStorage.getItem("onboarding_objetivo") || "explorando";
  const env = environmentMap[objetivo] || environmentMap.explorando;

  const handleContinue = () => {
    sessionStorage.setItem("onboarding_complete", "true");
    navigate("/selecionar-ambiente");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9EB038]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center relative z-10 space-y-8"
      >
        {/* MarIAna avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto w-24 h-24 rounded-full bg-[#1a1c19] border-2 border-[#9EB038]/30 p-3 shadow-lg shadow-[#9EB038]/10"
        >
          <img src={logoMariana} alt="MarIAna" className="w-full h-full object-contain" />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Olá, <span className="text-[#9EB038]">{nome}</span>!
          </h1>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left space-y-3">
            <div className="flex items-center gap-2 text-[#9EB038]">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">MarIAna</span>
            </div>

            <p className="text-white/90 text-base leading-relaxed">
              Sou a <strong className="text-[#9EB038]">MarIAna</strong>, sua assistente de IA aqui na plataforma.
            </p>

            <p className="text-white/80 text-base leading-relaxed">
              Com base no seu perfil, recomendo começar pelo{" "}
              <strong className="text-[#9EB038]">{env.name}</strong> — {env.description}.
            </p>

            <p className="text-white/60 text-sm">
              Mas fique à vontade para explorar qualquer ambiente quando quiser!
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Button
            onClick={handleContinue}
            className="h-12 px-8 bg-[#9EB038] hover:bg-[#8a9a31] text-white font-medium rounded-xl text-base gap-2"
          >
            Escolher meu ambiente
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
