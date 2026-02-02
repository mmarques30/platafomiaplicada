import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { AuthHeader } from "@/components/auth/AuthHeader";

const PURCHASE_LINK = "https://clkdmg.site/pay/iaplicadaacademy";
const SUPPORT_LINK = "https://wa.me/5511999999999"; // Substituir pelo número real

export default function AcessoExpirado() {
  const navigate = useNavigate();
  const [cupom, setCupom] = useState("Academy12");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Buscar dados do perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_visitante, acesso_expirado, cupom_especial, conta_ativa")
        .eq("id", user.id)
        .single();

      // Se não é visitante expirado, redirecionar
      if (!profile?.is_visitante || !profile?.acesso_expirado) {
        navigate("/");
        return;
      }

      setCupom(profile.cupom_especial || "Academy12");
      setLoading(false);
    };

    checkAccess();
  }, [navigate]);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(cupom);
    toast.success("Cupom copiado!", {
      description: "Cole no checkout para aplicar o desconto.",
    });
  };

  const handlePurchase = () => {
    window.open(PURCHASE_LINK, "_blank");
  };

  const handleSupport = () => {
    window.open(SUPPORT_LINK, "_blank");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const desconto = cupom === "Academy15" ? "15%" : "12%";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <AuthHeader />

      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg text-center"
        >
          {/* Card principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-6"
          >
            {/* Ícone */}
            <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-400" />
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Seu período de acesso gratuito expirou
              </h1>
              <p className="text-white/70">
                Você aproveitou 30 dias explorando a comunidade IAplicada. 
                Para continuar sua jornada de aprendizado em IA, conheça o Academy com desconto exclusivo!
              </p>
            </div>

            {/* Cupom */}
            <div className="bg-aplicada-green-600/30 border border-aplicada-green-400/50 rounded-xl p-4 space-y-3">
              <p className="text-white/80 text-sm">
                Seu cupom especial de <span className="font-bold text-aplicada-green-300">{desconto} de desconto</span>:
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="bg-white/20 px-4 py-2 rounded-lg text-white font-bold text-xl tracking-wider">
                  {cupom}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCoupon}
                  className="text-white hover:bg-white/20"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePurchase}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Conhecer Academy
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSupport}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Falar com Suporte
              </Button>
            </div>

            {/* Link de logout */}
            <button
              onClick={handleLogout}
              className="text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              Sair da conta
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
