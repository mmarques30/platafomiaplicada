import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { IAplicadaBackground } from "@/components/auth/IAplicadaBackground";
import { EntryHero } from "@/components/auth/EntryHero";
import { EntryAccessCard, type EntryAccessMode } from "@/components/auth/EntryAccessCard";
import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";

type EntryView = "hero" | EntryAccessMode;

function viewFromTab(tab: string | null): EntryView {
  if (tab === "signup") return "signup";
  if (tab === "login") return "login";
  return "hero";
}

/**
 * /auth — acesso inicial da plataforma.
 *
 * 1. Hero no branding da LP iaplicada.com (fundo quadriculado escuro, frase
 *    do que a pessoa pode fazer ao entrar, CTA "Começar a aplicar").
 * 2. Ao clicar, o hero dá lugar ao card de acesso (email + senha).
 * 3. Autenticou → vai para "/" e o EnvironmentProvider já resolve o ambiente
 *    de acordo com o plano. A antiga tela "Selecione seu ambiente" não existe
 *    mais.
 */
export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const tab = searchParams.get("tab");
  const [view, setView] = useState<EntryView>(() => viewFromTab(tab));

  // Links externos (?tab=login / ?tab=signup) abrem direto o card de acesso.
  useEffect(() => {
    if (tab) setView(viewFromTab(tab));
  }, [tab]);

  // Redirecionar usuários já autenticados
  useEffect(() => {
    if (!loading && user) {
      const onboardingComplete = sessionStorage.getItem("onboarding_complete");
      const hasOnboardingData = sessionStorage.getItem("onboarding_nome");

      // Novo cadastro com dados de onboarding → tela de boas-vindas
      if (hasOnboardingData && !onboardingComplete) {
        navigate("/onboarding-welcome", { replace: true });
        return;
      }

      // Entra direto: o ambiente é resolvido pelo plano do usuário.
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="ia-entry relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden">
      <IAplicadaBackground />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-12 pt-10 md:pb-16">
        <AnimatePresence mode="wait">
          {view === "hero" ? (
            <motion.div
              key="hero"
              className="flex w-full justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4 }}
            >
              <EntryHero onStart={() => setView("login")} />
            </motion.div>
          ) : (
            <motion.div
              key="access"
              className="flex w-full justify-center"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex w-full max-w-md flex-col items-center gap-8">
                <img src={logoIAplicada} alt="IAplicada" className="h-7 w-auto md:h-8" />
                <EntryAccessCard
                  mode={view}
                  onModeChange={setView}
                  onBack={() => setView("hero")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="ia-entry-footer relative z-10 px-6 pb-6 text-center">
        Ao continuar, você concorda com nossos{" "}
        <a href="/termos-uso">Termos</a> e <a href="/politica-privacidade">Privacidade</a>.
      </footer>
    </div>
  );
}
