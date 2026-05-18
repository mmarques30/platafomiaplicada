import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RecuperarSenhaModal } from "@/components/auth/RecuperarSenhaModal";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { GoogleLoginVerificationModal } from "@/components/auth/GoogleLoginVerificationModal";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);
  const [showGoogleVerification, setShowGoogleVerification] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

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
      <form onSubmit={handleSignIn} className="space-y-5">
        <div className="space-y-2 text-left">
          <Label htmlFor="signin-email" className="text-white/80 text-sm font-medium">
            Email
          </Label>
          <Input
            id="signin-email"
            name="signin-email"
            type="email"
            placeholder="seu@email.com"
            required
            className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-primary focus:ring-primary/30 [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(39,39,42)_inset]"
          />
        </div>
        
        <div className="space-y-2 text-left">
          <Label htmlFor="signin-password" className="text-white/80 text-sm font-medium">
            Senha
          </Label>
          <PasswordInput
            id="signin-password"
            name="signin-password"
            placeholder="••••••••"
            required
            className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-primary focus:ring-primary/30 [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(39,39,42)_inset]"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-brand-strong hover:bg-brand-strong/90 text-brand-strong-foreground font-medium rounded-lg transition-all mt-4" 
          disabled={isLoading}
        >
          {isLoading ? "Acessando..." : "Acessar"}
        </Button>

        {/* Divisor com "ou" */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-900 px-4 text-white/40">ou</span>
          </div>
        </div>

        {/* Botão Google */}
        <GoogleLoginButton onClick={() => setShowGoogleVerification(true)} />

        {/* Link esqueceu a senha */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => setShowRecuperarSenha(true)}
            className="text-sm text-white/50 hover:text-primary transition-colors"
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

      {/* Modal de verificação Google */}
      <GoogleLoginVerificationModal
        open={showGoogleVerification}
        onOpenChange={setShowGoogleVerification}
      />
    </>
  );
}
