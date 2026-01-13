import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Check, X, Loader2, Lock, CheckCircle } from "lucide-react";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [senhaAlterada, setSenhaAlterada] = useState(false);
  const [verificandoToken, setVerificandoToken] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);

  // Verificar se há uma sessão de recuperação ativa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se há sessão, o token foi validado pelo Supabase
        if (session) {
          setTokenValido(true);
        } else {
          // Verificar se há hash com token de recuperação
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const type = hashParams.get("type");
          
          if (accessToken && type === "recovery") {
            // Supabase vai processar automaticamente
            setTokenValido(true);
          } else {
            setTokenValido(false);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setTokenValido(false);
      } finally {
        setVerificandoToken(false);
      }
    };

    // Listener para mudanças de auth (quando o token é processado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setTokenValido(true);
        setVerificandoToken(false);
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

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

    setIsLoading(true);

    try {
      // 1. Atualizar senha via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (updateError) throw updateError;

      // 2. Buscar dados do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 3. Atualizar profile
        await supabase
          .from("profiles")
          .update({
            senha_temporaria: false,
            senha_alterada_em: new Date().toISOString(),
          })
          .eq("id", user.id);

        // 4. Atualizar status da solicitação de reset
        await supabase
          .from("password_reset_requests")
          .update({
            status: "senha_alterada",
            completed_at: new Date().toISOString(),
          })
          .eq("email", user.email?.toLowerCase())
          .eq("status", "link_enviado")
          .order("created_at", { ascending: false })
          .limit(1);

        // 5. Registrar na auditoria
        await supabase.from("auditoria_conteudo").insert({
          tabela: "profiles",
          registro_id: user.id,
          operacao: "PASSWORD_RECOVERY",
          user_id: user.id,
          dados_novos: {
            acao: "Senha redefinida pelo usuário via link de recuperação",
            email: user.email,
          },
        });
      }

      setSenhaAlterada(true);
      toast.success("Senha alterada com sucesso!");

      // Fazer logout para forçar novo login com a nova senha
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/auth");
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      toast.error(error.message || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading enquanto verifica token
  if (verificandoToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151515]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#9EB038] mx-auto" />
          <p className="text-white/60">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  // Token inválido ou expirado
  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151515] p-6">
        <div className="w-full max-w-md text-center space-y-6 bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
          <X className="h-16 w-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Link inválido ou expirado</h1>
            <p className="text-white/60">
              O link de recuperação pode ter expirado ou já foi utilizado.
              Solicite um novo link na página de login.
            </p>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            className="w-full bg-[#9EB038] hover:bg-[#8a9a31] text-white"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  // Senha alterada com sucesso
  if (senhaAlterada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151515] p-6">
        <div className="w-full max-w-md text-center space-y-6 bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
          <CheckCircle className="h-16 w-16 text-[#9EB038] mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Senha alterada!</h1>
            <p className="text-white/60">
              Sua senha foi redefinida com sucesso. Você será redirecionado para fazer login.
            </p>
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-[#9EB038] mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151515] p-6">
      <div className="w-full max-w-md space-y-6 bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
        <div className="text-center space-y-2">
          <Lock className="h-12 w-12 text-[#9EB038] mx-auto" />
          <h1 className="text-2xl font-bold text-white">Criar nova senha</h1>
          <p className="text-white/60 text-sm">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nova-senha" className="text-white/80 text-sm font-medium">
              Nova senha
            </Label>
            <PasswordInput
              id="nova-senha"
              placeholder="Digite sua nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmar-senha" className="text-white/80 text-sm font-medium">
              Confirmar senha
            </Label>
            <PasswordInput
              id="confirmar-senha"
              placeholder="Confirme sua nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
            />
          </div>

          {/* Requisitos de senha */}
          <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/60 font-medium mb-2">Requisitos da senha:</p>
            <RequisitoItem atendido={temMinimo8} texto="Mínimo 8 caracteres" />
            <RequisitoItem atendido={temMaiuscula} texto="Uma letra maiúscula" />
            <RequisitoItem atendido={temNumero} texto="Um número" />
            <RequisitoItem atendido={senhasIguais} texto="Senhas coincidem" />
          </div>

          <Button
            type="submit"
            disabled={!senhaValida || isLoading}
            className="w-full h-12 bg-[#9EB038] hover:bg-[#8a9a31] text-white font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar nova senha"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-white/40">
          Lembrou a senha?{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-[#9EB038] hover:underline"
          >
            Voltar para login
          </button>
        </p>
      </div>
    </div>
  );
}

function RequisitoItem({ atendido, texto }: { atendido: boolean; texto: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {atendido ? (
        <Check className="h-4 w-4 text-[#9EB038]" />
      ) : (
        <X className="h-4 w-4 text-white/30" />
      )}
      <span className={atendido ? "text-white" : "text-white/50"}>{texto}</span>
    </div>
  );
}
