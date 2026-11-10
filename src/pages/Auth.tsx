import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { AberturaMarca } from "@/components/auth/AberturaMarca";
import { FolhasLiquidas } from "@/components/auth/FolhasLiquidas";
import { LinhaRevelada } from "@/components/auth/LinhaRevelada";
import { LoginForm } from "@/components/auth/LoginForm";
import { COMPASSO, deveTocarAbertura, sobeEAparece } from "@/components/auth/motion-entrada";
import { useAuth } from "@/hooks/useAuth";
import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";

/**
 * /auth — a tela de acesso.
 *
 * O que mudou na estrutura
 *
 * Antes eram duas cenas: um hero com a proposta e um botão "Começar a
 * aplicar", e só depois o formulário, que entrava no lugar do hero. Quem já
 * tinha conta — que é todo mundo que chega aqui, porque não existe cadastro
 * público — pagava um clique e uma animação para ver dois campos.
 *
 * Agora é uma tela só, em duas colunas: a proposta à esquerda, o acesso à
 * direita. Nenhuma palavra foi tirada; o que saiu foi o botão que só servia
 * para revelar o que agora já está na tela. No celular as colunas empilham, e
 * a proposta vem antes do formulário, que é a ordem de leitura.
 *
 * O que mudou no visual
 *
 * O fundo deixou de ser dois orbes parados e virou a marca em estado líquido:
 * folhas da IAplicada flutuando e se fundindo umas nas outras por um filtro
 * SVG, em `FolhasLiquidas`. A forma é a do símbolo, não uma bola qualquer.
 *
 * O que não mudou
 *
 * A autenticação, os nomes dos campos, o `autocomplete`, a validação, o erro e
 * o redirecionamento. Trocou-se a casca, não o formulário.
 */
export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // A tela só começa a própria chegada depois que a cortina da abertura sobe.
  const [abrindo, setAbrindo] = useState<boolean>(() => deveTocarAbertura());

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

  const cena = abrindo ? "inicial" : "ativo";

  return (
    <div className="ia-login">
      {abrindo && <AberturaMarca onConcluir={() => setAbrindo(false)} />}

      <FolhasLiquidas segurar={abrindo} />

      <div className="ia-login-conteudo">
        <main className="flex flex-1 items-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_minmax(0,420px)] lg:gap-20">
            {/* A proposta. Mesmo texto de antes, palavra por palavra. */}
            <section className="max-w-xl">
              <motion.div
                variants={sobeEAparece(COMPASSO.marca, 0.7)}
                initial="inicial"
                animate={cena}
              >
                <img src={logoIAplicada} alt="IAplicada" className="h-7 w-auto md:h-8" />
              </motion.div>

              <h1 className="ia-login-titulo mt-9 md:mt-11">
                <LinhaRevelada atraso={COMPASSO.tituloPrimeiraLinha}>Faça o dobro.</LinhaRevelada>
                <LinhaRevelada atraso={COMPASSO.tituloSegundaLinha}>
                  <em>Entregue em metade do tempo.</em>
                </LinhaRevelada>
              </h1>

              <motion.p
                variants={sobeEAparece(COMPASSO.apoio)}
                initial="inicial"
                animate={cena}
                className="mt-6 max-w-md text-sm text-muted-foreground md:mt-7 md:text-base"
              >
                Tudo em um só lugar para você aumentar seus resultados.
              </motion.p>
            </section>

            {/* O acesso. */}
            <motion.section
              variants={sobeEAparece(COMPASSO.acao, 0.7)}
              initial="inicial"
              animate={cena}
              className="w-full"
            >
              <span className="ia-login-id">Acesso à plataforma</span>
              <h2 className="ia-login-titulo mt-3 text-[2rem] md:text-[2.25rem]">Entrar</h2>

              <div className="mt-9">
                <LoginForm />
              </div>
            </motion.section>
          </div>
        </main>

        <footer className="px-6 pb-8 text-xs text-muted-foreground sm:px-10 lg:px-16 xl:px-24">
          Ao continuar, você concorda com nossos{" "}
          <a href="/termos-uso" className="text-foreground/70 underline-offset-4 hover:underline">
            Termos
          </a>{" "}
          e{" "}
          <a
            href="/politica-privacidade"
            className="text-foreground/70 underline-offset-4 hover:underline"
          >
            Privacidade
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
