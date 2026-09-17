import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RecuperarSenhaModal } from "@/components/auth/RecuperarSenhaModal";
import { LetrasQueGiram } from "@/components/auth/LetrasQueGiram";

/**
 * Formulário de acesso (e-mail + senha), direto sobre o fundo escuro, sem
 * card. Os campos ficam translúcidos e clareiam ao receber foco, e o de baixo
 * ganha a borda lime quando está ativo (ver .ia-entry-input em index.css).
 *
 * O botão "Acessar" ficou com o relevo do refractweb.com: um fio de luz por
 * dentro da borda de cima, sombra por dentro embaixo, e um brilho largo e
 * baixo que acende a área ao redor sem virar um halo pulsante. Ele sobe 2px no
 * hover e afunda no clique, que é o que dá a sensação de botão físico.
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
      <form onSubmit={handleSignIn} className="space-y-2.5">
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
          className="ia-entry-acessar mt-5 w-full disabled:pointer-events-none disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Acessando..." : "Acessar"}
        </button>

        {/* Link esqueceu a senha */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setShowRecuperarSenha(true)}
            className="ia-entry-link group/letras"
          >
            <LetrasQueGiram texto="Esqueceu a senha?" />
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
