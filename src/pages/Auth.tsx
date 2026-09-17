import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { deveTocarAbertura, trocaDeCena } from "@/components/auth/motion-entrada";
import { AberturaMarca } from "@/components/auth/AberturaMarca";
import { MarcaIAplicada } from "@/components/shared/MarcaIAplicada";
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
 * 1. Hero com a proposta da LP, alinhado à esquerda numa coluna, com o fundo
 *    respirando à direita.
 * 2. Ao clicar, o hero dá lugar ao acesso (email + senha) na mesma coluna e na
 *    mesma margem, então a troca é o conteúdo mudando no lugar.
 * 3. Autenticou → vai para "/" e o EnvironmentProvider resolve o ambiente de
 *    acordo com o plano. A antiga tela "Selecione seu ambiente" não existe mais.
 *
 * A coreografia da chegada mora em `motion-entrada.ts`. Cada cena é um
 * container de variantes: o pai declara `initial`/`animate`/`exit` uma vez e
 * cada filho traz o seu instante, em vez de repetir transições componente a
 * componente como estava antes.
 */
export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const tab = searchParams.get("tab");
  const [view, setView] = useState<EntryView>(() => viewFromTab(tab));
  // A tela só começa a própria chegada depois que a cortina da abertura sobe.
  const [abrindo, setAbrindo] = useState<boolean>(() => deveTocarAbertura());

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
    <div className="ia-entry relative flex min-h-[100dvh] w-full flex-col overflow-hidden">
      {abrindo && <AberturaMarca onConcluir={() => setAbrindo(false)} />}

      <IAplicadaBackground />

      {/* A marca, grande e lenta, ocupando a metade direita. É o que o site de
          referência faz com um objeto 3D: o lado que não tem texto ganha um
          assunto, em vez de ficar vazio. Some no celular, onde não há metade
          direita. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6vw] top-1/2 z-[1] hidden w-[46vw] -translate-y-1/2 md:block lg:right-[-2vw] lg:w-[40vw]"
        initial={{ opacity: 0, scale: 0.92, rotate: -8 }}
        animate={abrindo ? { opacity: 0, scale: 0.92, rotate: -8 } : { opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.6, ease: trocaDeCena.ease, delay: 0.1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 160, ease: "linear", repeat: Infinity }}
        >
          <MarcaIAplicada className="w-full opacity-[0.16]" />
        </motion.div>
      </motion.div>

      <main className="relative z-10 flex flex-1 items-center px-6 pb-12 pt-16 md:px-12 md:pb-16 lg:px-20">
        <div className="w-full md:w-[68%] lg:w-[66%] xl:w-[58%]">
          <AnimatePresence mode="wait">
            {view === "hero" ? (
              <motion.div
                key="hero"
                initial="inicial"
                animate={abrindo ? "inicial" : "ativo"}
                exit="saida"
                transition={trocaDeCena}
              >
                <EntryHero onStart={() => setView("login")} />
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial="inicial"
                animate={abrindo ? "inicial" : "ativo"}
                exit="saida"
                transition={trocaDeCena}
              >
                <EntryLogin onBack={() => setView("hero")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="ia-entry-footer relative z-10 px-6 pb-7 md:px-12 lg:px-20">
        Ao continuar, você concorda com nossos{" "}
        <a href="/termos-uso">Termos</a> e <a href="/politica-privacidade">Privacidade</a>.
      </footer>
    </div>
  );
}
