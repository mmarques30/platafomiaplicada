import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, ExternalLink, Clock, AlertTriangle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVisitorExpiration } from "@/hooks/useVisitorExpiration";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PURCHASE_LINK = "https://clkdmg.site/pay/iaplicadaacademy";

export function VisitorExpirationNotice() {
  const { data, dismissNotice, isLoading } = useVisitorExpiration();
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissedSession, setHasDismissedSession] = useState(false);

  useEffect(() => {
    // Verificar se já foi fechado nesta sessão
    const dismissed = sessionStorage.getItem("visitor_notice_dismissed");
    if (dismissed) {
      setHasDismissedSession(true);
    }
  }, []);

  useEffect(() => {
    // Mostrar popup se houver notificação pendente e não foi fechado na sessão
    if (data?.notificacaoPendente && !hasDismissedSession) {
      // Pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [data?.notificacaoPendente, hasDismissedSession]);

  const handleDismiss = async () => {
    setIsVisible(false);
    setHasDismissedSession(true);
    sessionStorage.setItem("visitor_notice_dismissed", "true");
    
    if (data?.notificacaoPendente?.id) {
      dismissNotice.mutate(data.notificacaoPendente.id);
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(data?.cupomEspecial || "Academy12");
    toast.success("Cupom copiado!", {
      description: "Cole no checkout para aplicar o desconto.",
    });
  };

  const handlePurchase = () => {
    window.open(PURCHASE_LINK, "_blank");
  };

  if (isLoading || !data?.notificacaoPendente || hasDismissedSession) {
    return null;
  }

  const noticeType = data.notificacaoPendente.notice_type;
  const diasRestantes = data.diasRestantes ?? 0;
  const desconto = data.isEngajado ? "15%" : "12%";

  // Configurações visuais baseadas na urgência
  const urgencyConfig = {
    "7_dias": {
      icon: Gift,
      title: "Seu acesso gratuito expira em 7 dias",
      description: `Você aproveitou bem a comunidade! Garanta ${desconto} de desconto exclusivo no Academy e continue sua jornada de aprendizado em IA.`,
      bgClass: "bg-aplicada-green-600/95",
      borderClass: "border-aplicada-green-400",
    },
    "3_dias": {
      icon: Clock,
      title: "Restam apenas 3 dias de acesso gratuito",
      description: `O tempo está passando! Aproveite ${desconto} de desconto exclusivo no Academy antes que seu acesso expire.`,
      bgClass: "bg-amber-600/95",
      borderClass: "border-amber-400",
    },
    "1_dia": {
      icon: AlertTriangle,
      title: "Último dia de acesso gratuito",
      description: `Esta é sua última chance de garantir ${desconto} de desconto no Academy. Amanhã seu acesso será encerrado.`,
      bgClass: "bg-red-600/95",
      borderClass: "border-red-400",
    },
  };

  const config = urgencyConfig[noticeType as keyof typeof urgencyConfig] || urgencyConfig["7_dias"];
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl",
            "rounded-2xl border shadow-2xl backdrop-blur-sm",
            config.bgClass,
            config.borderClass
          )}
        >
          <div className="relative p-4 sm:p-6">
            {/* Botão fechar */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 text-white/80" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Ícone */}
              <div className="flex-shrink-0 p-3 bg-white/20 rounded-full">
                <IconComponent className="h-6 w-6 text-white" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-white pr-8">
                  {config.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {config.description}
                </p>
                
                {/* Cupom */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-white/70 text-sm">Cupom:</span>
                  <code className="bg-white/20 px-3 py-1 rounded-lg text-white font-bold">
                    {data.cupomEspecial}
                  </code>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCoupon}
                  className="flex-1 sm:flex-none bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  className="flex-1 sm:flex-none bg-white hover:bg-white/90 text-aplicada-green-700 font-semibold"
                >
                  Conhecer Academy
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
