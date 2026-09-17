import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { LetrasQueGiram } from "./LetrasQueGiram";
import { LinhaRevelada } from "./LinhaRevelada";
import { COMPASSO, sobeEAparece } from "./motion-entrada";
import { LoginForm } from "@/components/auth/LoginForm";
import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";

interface EntryLoginProps {
  onBack: () => void;
}

/**
 * EntryLogin — o acesso, direto sobre o fundo, sem card.
 *
 * Os campos são os mesmos: e-mail, senha, "Acessar" e "Esqueceu a senha?".
 * Não existe criação de conta, porque o acesso é dado pela IAplicada conforme
 * o plano.
 *
 * O que mudou: antes isso era uma coluna estreita centralizada, e sair do hero
 * jogava o olho do canto esquerdo para o meio da tela. Agora o acesso nasce na
 * mesma coluna e na mesma margem do título, então a troca é o conteúdo mudando
 * no lugar, não a página se reorganizando. A marca e o título repetem o mesmo
 * compasso de chegada do hero, com os degraus mais curtos, porque aqui a
 * pessoa já chegou: ela quer digitar.
 */
export function EntryLogin({ onBack }: EntryLoginProps) {
  return (
    <div className="w-full max-w-sm text-left">
      <motion.div variants={sobeEAparece(COMPASSO.marca, 0.6)} className="ia-entry-marca">
        <img src={logoIAplicada} alt="IAplicada" className="ia-entry-marca__logo" />
        <span className="ia-entry-marca__rule" aria-hidden />
      </motion.div>

      <h1 className="ia-entry-login-title mt-8">
        <LinhaRevelada atraso={COMPASSO.tituloPrimeiraLinha}>Entrar</LinhaRevelada>
      </h1>

      <motion.div variants={sobeEAparece(COMPASSO.apoio - 0.2, 0.6)} className="mt-7 w-full">
        <LoginForm />
      </motion.div>

      <motion.div variants={sobeEAparece(COMPASSO.acao - 0.2, 0.6)} className="mt-8">
        <button type="button" onClick={onBack} className="ia-entry-link group/letras">
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover/letras:-translate-x-1" />
          <LetrasQueGiram texto="Voltar" />
        </button>
      </motion.div>
    </div>
  );
}
