import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { GoogleLoginVerificationModal } from "@/components/auth/GoogleLoginVerificationModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputClasses = "bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20 [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgb(39,39,42)_inset]";

const selectTriggerClasses = "bg-zinc-800/80 border-white/10 text-white h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20 data-[placeholder]:text-white/40";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleVerification, setShowGoogleVerification] = useState(false);
  const [objetivo, setObjetivo] = useState("");
  const [areaAtuacao, setAreaAtuacao] = useState("");
  const [desafio, setDesafio] = useState("");

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
    
    if (!objetivo || !areaAtuacao) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("visitor-email") as string;
    const password = formData.get("visitor-password") as string;
    const nome = formData.get("visitor-name") as string;
    const telefone = formData.get("visitor-phone") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
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
        if (error.message?.includes("User already registered")) {
          toast.error("Este email já está cadastrado. Use a aba 'Entrar' para fazer login.");
        } else {
          toast.error(error.message || "Erro ao processar cadastro");
        }
        setIsLoading(false);
        return;
      }
      
      await logSignupAttempt(email, nome, telefone, true);

      // Salvar respostas de onboarding
      if (data?.user?.id) {
        try {
          await supabase.from('user_onboarding_responses').insert({
            user_id: data.user.id,
            nome,
            objetivo,
            area_atuacao: areaAtuacao,
            desafio_principal: desafio || null,
          });
        } catch (onboardingError) {
          console.error('Erro ao salvar onboarding:', onboardingError);
        }
      }

      toast.success("Cadastro realizado! Bem-vindo à IAplicada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
            className={inputClasses}
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
            className={inputClasses}
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
            className={inputClasses}
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
            className={inputClasses}
          />
          <p className="text-xs text-white/50">
            Você vai usar essa senha para acessar depois
          </p>
        </div>

        {/* Objetivo */}
        <div className="space-y-2 text-left">
          <Label className="text-white/80 text-sm font-medium">
            Qual seu objetivo principal?
          </Label>
          <Select value={objetivo} onValueChange={setObjetivo} required>
            <SelectTrigger className={selectTriggerClasses}>
              <SelectValue placeholder="Selecione um objetivo" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10">
              <SelectItem value="desenvolver_habilidades_ia">Desenvolver habilidades com IA</SelectItem>
              <SelectItem value="melhorar_produtividade_time">Melhorar produtividade do meu time</SelectItem>
              <SelectItem value="organizar_operacao">Organizar minha operação</SelectItem>
              <SelectItem value="explorando">Só estou explorando</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Área de atuação */}
        <div className="space-y-2 text-left">
          <Label className="text-white/80 text-sm font-medium">
            Área de atuação
          </Label>
          <Select value={areaAtuacao} onValueChange={setAreaAtuacao} required>
            <SelectTrigger className={selectTriggerClasses}>
              <SelectValue placeholder="Selecione sua área" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10">
              <SelectItem value="tecnologia">Tecnologia</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="operacoes">Operações</SelectItem>
              <SelectItem value="gestao">Gestão</SelectItem>
              <SelectItem value="rh">RH</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desafio */}
        <div className="space-y-2 text-left">
          <Label className="text-white/80 text-sm font-medium">
            Qual seu maior desafio hoje? <span className="text-white/40">(opcional)</span>
          </Label>
          <Textarea
            value={desafio}
            onChange={(e) => setDesafio(e.target.value.slice(0, 200))}
            placeholder="Descreva brevemente..."
            maxLength={200}
            className="bg-zinc-800/80 border-white/10 text-white placeholder:text-white/40 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20 min-h-[80px] resize-none"
          />
          <p className="text-xs text-white/40 text-right">{desafio.length}/200</p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-[#9EB038] hover:bg-[#8a9a31] text-white font-medium rounded-lg transition-all mt-2" 
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta grátis"}
        </Button>

        {/* Divisor */}
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
      </form>

      {/* Modal de verificação Google */}
      <GoogleLoginVerificationModal
        open={showGoogleVerification}
        onOpenChange={setShowGoogleVerification}
      />
    </>
  );
}
