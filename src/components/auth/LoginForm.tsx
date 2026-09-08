import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RecuperarSenhaModal } from "@/components/auth/RecuperarSenhaModal";

/**
 * Formulário de acesso (e-mail + senha), versão discreta sobre o fundo
 * escuro do acesso inicial. Os campos ficam translúcidos e clareiam ao
 * receber foco (ver .ia-entry-input em index.css).
 */
export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = ((formData.get("signin-email") as string) || "").trim().toLowerCase();
    const password = (formData.get("signin-password") as string) || "";

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignIn} className="space-y-3">
        <div className="ia-entry-field">
          <Label htmlFor="signin-email" className="sr-only">
            Email
          </Label>
          <Input
            id="signin-email"
            name="signin-email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            className="ia-entry-input"
          />
        </div>
        
        <div className="ia-entry-field">
          <Label htmlFor="signin-password" className="sr-only">
            Senha
          </Label>
          <PasswordInput
            id="signin-password"
            name="signin-password"
            placeholder="Senha"
            autoComplete="current-password"
            required
            className="ia-entry-input"
          />
        </div>
        
        <button
          type="submit"
          className="ia-entry-form-cta mt-2 h-12 w-full rounded-full text-[13.5px] uppercase tracking-[0.06em] disabled:pointer-events-none disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Acessando..." : "Acessar"}
        </button>

        {/* Link esqueceu a senha */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowRecuperarSenha(true)}
            className="ia-entry-link"
          >
            Esqueceu a senha?
          </button>
        </div>
      </form>

      {/* Modal de recuperação de senha */}
      <RecuperarSenhaModal
        open={showRecuperarSenha}
        onOpenChange={setShowRecuperarSenha}
      />
    </>
  );
}
