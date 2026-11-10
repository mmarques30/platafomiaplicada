import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { RecuperarSenhaModal } from "@/components/auth/RecuperarSenhaModal";

/**
 * O formulário de acesso.
 *
 * Só a casca mudou. A chamada de autenticação, os `name` dos campos, o
 * `autocomplete`, a validação, a mensagem de erro e o modal de recuperação
 * continuam exatamente os mesmos — é por isso que o gerenciador de senha
 * segue preenchendo e o fluxo de recuperar senha segue chegando no mesmo
 * lugar.
 *
 * O que mudou: os campos perderam a caixa. Agora são um fio embaixo que
 * acende de ponta a ponta no foco, e o grupo inteiro anda 8px para a direita,
 * o que diz "é aqui" sem precisar de borda colorida em volta. O rótulo saiu do
 * `sr-only` e virou texto em mono acima do campo: a referência mostra que
 * rótulo visível fica melhor que placeholder, porque o placeholder some
 * justamente quando a pessoa precisa dele.
 *
 * O botão são duas camadas dentro do filtro de fusão: a pastilha lime por
 * baixo e o botão por cima. No hover a pastilha cresce um pouco mais, e o
 * filtro faz ela escorrer pelas bordas como uma gota.
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
      <form onSubmit={handleSignIn} noValidate={false}>
        <div className="ia-login-grupo">
          <label htmlFor="signin-email" className="ia-login-rotulo">
            E-mail
          </label>
          <Input
            id="signin-email"
            name="signin-email"
            type="email"
            placeholder="voce@empresa.com"
            autoComplete="email"
            required
            className="ia-login-campo"
          />
          <span className="ia-login-brilho" aria-hidden="true" />
        </div>

        <div className="ia-login-grupo mt-7">
          <label htmlFor="signin-password" className="ia-login-rotulo">
            Senha
          </label>
          <PasswordInput
            id="signin-password"
            name="signin-password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="ia-login-campo"
          />
          <span className="ia-login-brilho" aria-hidden="true" />
        </div>

        <div className="ia-login-botao-area mt-10">
          <span className="ia-login-gota" aria-hidden="true" />
          <button type="submit" className="ia-login-botao" disabled={isLoading}>
            {isLoading ? "Acessando" : "Acessar"}
          </button>
        </div>

        <div className="ia-login-rodape mt-8">
          <button type="button" onClick={() => setShowRecuperarSenha(true)}>
            Esqueci minha senha
          </button>
          <a href="https://iaplicada.com" target="_blank" rel="noreferrer">
            iaplicada.com
          </a>
        </div>
      </form>

      <RecuperarSenhaModal open={showRecuperarSenha} onOpenChange={setShowRecuperarSenha} />
    </>
  );
}
