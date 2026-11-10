import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AberturaMarca } from "@/components/auth/AberturaMarca";
import { MolduraAcesso } from "@/components/auth/MolduraAcesso";
import { LoginForm } from "@/components/auth/LoginForm";
import { deveTocarAbertura } from "@/components/auth/motion-entrada";
import { useAuth } from "@/hooks/useAuth";

/**
 * /auth — a tela de acesso.
 *
 * Uma coluna, centrada, com as folhas da marca flutuando atrás. É a
 * composição da referência, e é a certa aqui: não existe cadastro público,
 * então todo mundo que chega nesta tela vem para digitar e-mail e senha. A
 * proposta do produto, que antes dividia a tela em duas colunas, era argumento
 * de venda numa porta onde já não há o que vender — quem chega já comprou.
 *
 * A moldura, os campos e o botão são os mesmos de redefinir senha e das outras
 * telas fora do shell. O que só existe aqui são as folhas: elas são o gesto de
 * chegada.
 *
 * A autenticação, os nomes dos campos, o `autocomplete`, a validação, o erro e
 * o redirecionamento continuam intocados.
 */
export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // A tela só aparece depois que a cortina da abertura sobe.
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

  return (
    <>
      {abrindo && <AberturaMarca onConcluir={() => setAbrindo(false)} />}

      <MolduraAcesso
        comFolhas
        segurarFolhas={abrindo}
        etiqueta="Acesso à plataforma"
        titulo="Entrar"
        pePagina={
          <>
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
          </>
        }
      >
        <LoginForm />
      </MolduraAcesso>
    </>
  );
}
