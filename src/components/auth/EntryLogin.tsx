import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import logoIAplicada from "@/assets/logo-auth-fundo-escuro.png";

interface EntryLoginProps {
  onBack: () => void;
}

/**
 * EntryLogin — acesso discreto, direto sobre o fundo da LP (sem card).
 * Só logo, título "Entrar", e-mail, senha, botão "Acessar" e
 * "Esqueceu a senha?". Não existe criação de conta: o acesso é dado
 * pela IAplicada conforme o plano.
 */
export function EntryLogin({ onBack }: EntryLoginProps) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center text-center">
      <motion.img
        src={logoIAplicada}
        alt="IAplicada"
        className="h-7 w-auto md:h-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      />

      <motion.h1
        className="ia-entry-login-title mt-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        Entrar
      </motion.h1>

      <motion.div
        className="mt-7 w-full"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
      >
        <LoginForm />
      </motion.div>

      <motion.button
        type="button"
        onClick={onBack}
        className="ia-entry-link mt-8 inline-flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </motion.button>
    </div>
  );
}
