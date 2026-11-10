import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";
import { Check, X, Loader2 } from "lucide-react";
import { MolduraAcesso } from "@/components/auth/MolduraAcesso";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [senhaAlterada, setSenhaAlterada] = useState(false);
  const [tokenValido, setTokenValido] = useState(true);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Verificar se temos token e email na URL
    if (!token || !email) {
      setTokenValido(false);
    }
  }, [token, email]);

  // Validações de senha
  const temMinimo8 = novaSenha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(novaSenha);
  const temNumero = /[0-9]/.test(novaSenha);
  const senhasIguais = novaSenha === confirmarSenha && confirmarSenha.length > 0;
  const senhaValida = temMinimo8 && temMaiuscula && temNumero && senhasIguais;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senhaValida) {
      toast.error("A senha não atende aos requisitos");
      return;
    }

    if (!token || !email) {
      toast.error("Token ou email inválido");
      return;
    }

    setIsLoading(true);

    try {
      // Chamar edge function para redefinir senha com token
      const { data, error } = await supabase.functions.invoke('reset-password-with-token', {
        body: { 
          token, 
          email: decodeURIComponent(email), 
          novaSenha 
        }
      });

      if (error) {
        console.error("Error resetting password:", error);
        toast.error("Erro ao redefinir senha. Tente novamente.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        if (data.error.includes('expirado') || data.error.includes('inválido')) {
          setTokenValido(false);
        }
        return;
      }

      if (data?.success) {
        toast.success("Senha alterada com sucesso!");
        setSenhaAlterada(true);

        // Fazer logout de qualquer sessão ativa
        await supabase.auth.signOut();

        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      toast.error(error.message || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Token inválido ou expirado
  if (!tokenValido) {
    return (
      <MolduraAcesso
        etiqueta="Recuperação de senha"
        titulo="Link inválido ou expirado"
        apoio="O link pode ter expirado ou já ter sido usado. Peça um novo na tela de acesso."
      >
        <div className="ia-login-botao-area">
          <span className="ia-login-gota" aria-hidden="true" />
          <button type="button" onClick={() => navigate("/auth")} className="ia-login-botao">
            Voltar para o acesso
          </button>
        </div>
      </MolduraAcesso>
    );
  }

  // Senha alterada com sucesso
  if (senhaAlterada) {
    return (
      <MolduraAcesso
        etiqueta="Recuperação de senha"
        titulo="Senha alterada"
        apoio="Pronto. Estamos te levando de volta para o acesso."
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Redirecionando
        </div>
      </MolduraAcesso>
    );
  }

  return (
    <MolduraAcesso
      etiqueta="Recuperação de senha"
      titulo="Criar nova senha"
      apoio={email ? <>Para <span className="text-foreground">{decodeURIComponent(email)}</span>.</> : undefined}
      rodape="Este link expira em 15 minutos por segurança."
    >
      <form onSubmit={handleSubmit}>
        <div className="ia-login-grupo">
          <label htmlFor="nova-senha" className="ia-login-rotulo">
            Nova senha
          </label>
          <PasswordInput
            id="nova-senha"
            name="new-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            className="ia-login-campo"
          />
          <span className="ia-login-brilho" aria-hidden="true" />
        </div>

        <div className="ia-login-grupo mt-7">
          <label htmlFor="confirmar-senha" className="ia-login-rotulo">
            Confirmar senha
          </label>
          <PasswordInput
            id="confirmar-senha"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            className="ia-login-campo"
          />
          <span className="ia-login-brilho" aria-hidden="true" />
        </div>

        {/* Os requisitos marcam sozinhos conforme a pessoa digita: é o
            retorno que evita descobrir o que faltava só ao enviar. */}
        <ul className="mt-7 space-y-2">
          <RequisitoItem atendido={temMinimo8} texto="Mínimo de 8 caracteres" />
          <RequisitoItem atendido={temMaiuscula} texto="Uma letra maiúscula" />
          <RequisitoItem atendido={temNumero} texto="Um número" />
          <RequisitoItem atendido={senhasIguais} texto="As duas senhas coincidem" />
        </ul>

        <div className="ia-login-botao-area mt-9">
          <span className="ia-login-gota" aria-hidden="true" />
          <button type="submit" disabled={!senhaValida || isLoading} className="ia-login-botao">
            {isLoading ? "Salvando" : "Salvar nova senha"}
          </button>
        </div>
      </form>
    </MolduraAcesso>
  );
}

function RequisitoItem({ atendido, texto }: { atendido: boolean; texto: string }) {
  return (
    <li className="flex items-center gap-2.5 text-[13px]">
      {atendido ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
      ) : (
        <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={2} />
      )}
      <span className={atendido ? "text-foreground" : "text-muted-foreground"}>{texto}</span>
    </li>
  );
}
