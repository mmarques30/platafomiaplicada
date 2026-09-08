import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useEnvironmentSafe } from "@/hooks/useEnvironment";
import { IAplicadaBackground } from "@/components/auth/IAplicadaBackground";
import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";

const PURCHASE_LINK = "https://clkdmg.site/pay/iaplicadaacademy";
const SUPPORT_LINK = "https://wa.me/5511999999999"; // Substituir pelo número real

/**
 * /sem-acesso — quem se cadastrou gratuitamente (ou não tem plano) não entra
 * mais na plataforma. A conta continua na base; a tela convida para o
 * Academy no mesmo branding do acesso inicial.
 *
 * Quem tem algum ambiente disponível (Academy, Insider, equipe) é enviado
 * de volta para "/".
 */
export default function SemAcesso() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const environment = useEnvironmentSafe();
  const [cupom, setCupom] = useState<string>("Academy12");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (environment && !environment.isLoading && environment.hasAccess) {
      navigate("/", { replace: true });
    }
  }, [environment, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("cupom_especial")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.cupom_especial) setCupom(data.cupom_especial);
      });
  }, [user]);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(cupom);
    toast.success("Cupom copiado!", {
      description: "Cole no checkout para aplicar o desconto.",
    });
  };

  if (authLoading || !user || (environment && environment.isLoading)) {
    return (
      <div className="ia-entry flex min-h-[100dvh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#d5e95a]" />
      </div>
    );
  }

  return (
    <div className="ia-entry relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden">
      <IAplicadaBackground />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex w-full max-w-2xl flex-col items-center text-center"
        >
          <img src={logoIAplicada} alt="IAplicada" className="h-8 w-auto md:h-9" />

          <h1 className="ia-entry-h1 mt-10" style={{ fontSize: "clamp(34px, 4.6vw, 60px)" }}>
            O acesso gratuito
            <br />
            <em>chegou ao fim.</em>
          </h1>

          <p className="ia-entry-sub mx-auto mt-6 max-w-xl">
            A plataforma agora é exclusiva para alunos do Academy e clientes Insider.
            Para continuar aplicando IA no seu trabalho, conheça o Academy.
          </p>

          <div className="ia-entry-coupon mt-8">
            <span>Seu cupom de desconto</span>
            <button type="button" onClick={handleCopyCoupon} className="ia-entry-coupon__code">
              {cupom}
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          <a
            href={PURCHASE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="ia-entry-cta group mt-8"
          >
            <span className="ia-entry-cta__label">Conhecer o Academy</span>
            <span className="ia-entry-cta__icon" aria-hidden>
              <ArrowUpRight className="absolute h-5 w-5 -translate-x-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10" />
              <ArrowUpRight className="absolute h-5 w-5 -translate-x-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2" />
            </span>
          </a>

          <div className="mt-8 flex items-center gap-6">
            <a href={SUPPORT_LINK} target="_blank" rel="noopener noreferrer" className="ia-entry-link">
              Falar com a IAplicada
            </a>
            <button type="button" onClick={signOut} className="ia-entry-link">
              Sair
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
