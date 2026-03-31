import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Map, Calendar, Layers } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const logoMariana = "/logo-mariana.png?v=10";

const acoes = [
  {
    icon: Layers,
    label: "Conheça suas etapas",
    desc: "Veja o processo completo da sua jornada",
    path: "/mentoria",
  },
  {
    icon: Map,
    label: "Veja o roadmap do seu projeto",
    desc: "Entenda o que será construído e quando",
    path: "/mentoria?tab=roadmap",
  },
  {
    icon: Calendar,
    label: "Agende sua primeira sessão",
    desc: "Reserve um horário com seu mentor",
    path: "/notificacoes/calendario",
  },
];

export default function BusinessWelcome() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const nome = profile?.nome_completo?.split(" ")[0] || "parceiro";
  const mensagem =
    (profile as any)?.mensagem_boas_vindas ||
    "Estamos preparando tudo para você. Sua jornada de transformação com IA começa agora — com acompanhamento personalizado e resultados mensuráveis.";

  const handleEntrar = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ primeiro_acesso: false } as any)
          .eq("id", user.id);
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
    } catch (e) {
      console.error(e);
    }
    navigate("/");
  };

  const handleAcao = (path: string) => {
    // Don't update primeiro_acesso here — only on "Entrar na plataforma"
    navigate(path);
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
        className="max-w-lg w-full relative z-10 space-y-8"
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

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Bem-vindo à sua jornada, <span className="text-[#9EB038]">{nome}</span>!
          </h1>
        </motion.div>

        {/* Mensagem personalizada */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3"
        >
          <div className="flex items-center gap-2 text-[#9EB038]">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">MarIAna</span>
          </div>
          <p className="text-white/90 text-base leading-relaxed">{mensagem}</p>
        </motion.div>

        {/* 3 ações rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="space-y-3"
        >
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider text-center">
            Próximos passos
          </p>
          {acoes.map((acao, i) => (
            <motion.button
              key={acao.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
              onClick={() => handleAcao(acao.path)}
              className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#9EB038]/30 rounded-xl transition-all duration-200 group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#9EB038]/10 flex items-center justify-center shrink-0">
                <acao.icon className="w-5 h-5 text-[#9EB038]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{acao.label}</p>
                <p className="text-white/50 text-xs">{acao.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-[#9EB038] transition-colors shrink-0" />
            </motion.button>
          ))}
        </motion.div>

        {/* CTA principal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="text-center"
        >
          <Button
            onClick={handleEntrar}
            disabled={loading}
            className="h-12 px-8 bg-[#9EB038] hover:bg-[#8a9a31] text-white font-medium rounded-xl text-base gap-2"
          >
            {loading ? "Entrando..." : "Entrar na plataforma"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
