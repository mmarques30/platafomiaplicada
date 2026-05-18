import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RecuperarSenhaModal } from "@/components/auth/RecuperarSenhaModal";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);

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
          <Label htmlFor="signin-email" className="text-foreground text-sm font-medium">
            Email
          </Label>
          <Input
            id="signin-email"
            name="signin-email"
            type="email"
            placeholder="seu@email.com"
            required
            className="bg-brand-cream-soft border-brand-hairline text-foreground placeholder:text-muted-foreground h-12 rounded-lg focus:border-primary focus:ring-primary/30 "
          />
        </div>
        
        <div className="space-y-2 text-left">
          <Label htmlFor="signin-password" className="text-foreground text-sm font-medium">
            Senha
          </Label>
          <PasswordInput
            id="signin-password"
            name="signin-password"
            placeholder="••••••••"
            required
            className="bg-brand-cream-soft border-brand-hairline text-foreground placeholder:text-muted-foreground h-12 rounded-lg focus:border-primary focus:ring-primary/30 "
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium rounded-lg transition-all mt-4" 
          disabled={isLoading}
        >
          {isLoading ? "Acessando..." : "Acessar"}
        </Button>

        {/* Link esqueceu a senha */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => setShowRecuperarSenha(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
