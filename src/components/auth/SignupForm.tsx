import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);

  const logSignupAttempt = async (
    email: string, 
    nome: string, 
    telefone: string, 
    sucesso: boolean, 
    erroMensagem?: string
  ) => {
    try {
      await supabase.from('signup_attempts').insert({
        email,
        nome,
        telefone,
        sucesso,
        erro_mensagem: erroMensagem || null,
      });
    } catch (logError) {
      console.error('Erro ao registrar tentativa de signup:', logError);
    }
  };

  const handleVisitorSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("visitor-email") as string;
    const password = formData.get("visitor-password") as string;
    const nome = formData.get("visitor-name") as string;
    const telefone = formData.get("visitor-phone") as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo: nome,
            telefone: telefone,
            is_visitante: true
          }
        }
      });

      if (error) {
        await logSignupAttempt(email, nome, telefone, false, error.message);
        // Traduzir erro específico
        if (error.message?.includes("User already registered")) {
          toast.error("Este email já está cadastrado. Use a aba 'Entrar' para fazer login.");
        } else {
          toast.error(error.message || "Erro ao processar cadastro");
        }
        setIsLoading(false);
        return;
      }
      
      await logSignupAttempt(email, nome, telefone, true);
      toast.success("Cadastro realizado! Bem-vindo à IAplicada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVisitorSignup} className="space-y-4">
      <div className="space-y-2 text-left">
        <Label htmlFor="visitor-name" className="text-white/80 text-sm font-medium">
          Nome Completo
        </Label>
        <Input
          id="visitor-name"
          name="visitor-name"
          type="text"
          placeholder="Seu nome"
          required
          className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20 [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(39,39,42)_inset]"
        />
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="visitor-email" className="text-white/80 text-sm font-medium">
          Email
        </Label>
        <Input
          id="visitor-email"
          name="visitor-email"
          type="email"
          placeholder="seu@email.com"
          required
          className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20 [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(39,39,42)_inset]"
        />
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="visitor-phone" className="text-white/80 text-sm font-medium">
          Telefone
        </Label>
        <Input
          id="visitor-phone"
          name="visitor-phone"
          type="tel"
          placeholder="(00) 00000-0000"
          required
          className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20 [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(39,39,42)_inset]"
        />
      </div>
      
      <div className="space-y-2 text-left">
        <Label htmlFor="visitor-password" className="text-white/80 text-sm font-medium">
          Crie uma senha
        </Label>
        <PasswordInput
          id="visitor-password"
          name="visitor-password"
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
          className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20 [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(39,39,42)_inset]"
        />
        <p className="text-xs text-white/50">
          Você vai usar essa senha para acessar depois
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-12 bg-[#9EB038] hover:bg-[#8a9a31] text-white font-medium rounded-lg transition-all mt-2" 
        disabled={isLoading}
      >
        {isLoading ? "Criando conta..." : "Criar conta grátis"}
      </Button>
    </form>
  );
}
