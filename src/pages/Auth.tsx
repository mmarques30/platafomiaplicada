import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { IAplicadaBackground } from "@/components/auth/IAplicadaBackground";
import { EntryHero } from "@/components/auth/EntryHero";
import { EntryLogin } from "@/components/auth/EntryLogin";

type EntryView = "hero" | "login";

function viewFromTab(tab: string | null): EntryView {
  // Não existe mais criação de conta: qualquer ?tab abre o acesso.
  return tab ? "login" : "hero";
}

/**
 * /auth — acesso inicial da plataforma.
 *
 * 1. Hero no branding da LP iaplicada.com (fundo quadriculado escuro, frase
 *    do que a pessoa pode fazer ao entrar, CTA "Começar a aplicar").
 * 2. Ao clicar, o hero dá lugar ao acesso discreto (email + senha), sem card.
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

  // Links externos (?tab=login) abrem direto o acesso.
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
              key="login"
              className="flex w-full justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4 }}
            >
              <EntryLogin onBack={() => setView("hero")} />
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
