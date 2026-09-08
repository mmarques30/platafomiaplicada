import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

export type EntryAccessMode = "login" | "signup";

interface EntryAccessCardProps {
  mode: EntryAccessMode;
  onModeChange: (mode: EntryAccessMode) => void;
  onBack: () => void;
}

/**
 * EntryAccessCard — card claro sobre o fundo escuro, mesmo tratamento do
 * form do hero da LP iaplicada.com (creme translúcido + blur + glow lime ao
 * focar). Reaproveita LoginForm/SignupForm sem alterar a lógica de auth.
 *
 * Fluxo: quem entra com email + senha cai direto no ambiente que tem acesso
 * (não existe mais tela de seleção de ambiente).
 */
export function EntryAccessCard({ mode, onModeChange, onBack }: EntryAccessCardProps) {
  const isLogin = mode === "login";

  return (
    <div className="ia-entry-card w-full max-w-md text-left">
      <button
        type="button"
        onClick={onBack}
        className="ia-entry-card__back"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar
      </button>

      <p className="ia-entry-card__title mt-4">
        {isLogin ? "Entrar na plataforma" : "Criar sua conta"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {isLogin
          ? "Use seu e-mail e senha. Você entra direto no seu ambiente."
          : "Acesso gratuito para conhecer a plataforma e começar a aplicar."}
      </p>

      <div className="mt-6">{isLogin ? <LoginForm /> : <SignupForm />}</div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {isLogin ? (
          <>
            Ainda não tem acesso?{" "}
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              className="ia-entry-card__link"
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            Já tem acesso?{" "}
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className="ia-entry-card__link"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
