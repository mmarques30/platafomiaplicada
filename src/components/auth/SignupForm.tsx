import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputClasses = "bg-background border-brand-hairline text-foreground placeholder:text-muted-foreground h-12 rounded-lg focus:border-primary focus:ring-primary/30 ";

const selectTriggerClasses = "bg-background border-brand-hairline text-foreground h-12 rounded-lg focus:border-primary focus:ring-primary/30 data-[placeholder]:text-muted-foreground";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
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

      // Salvar dados para tela de onboarding
      sessionStorage.setItem("onboarding_nome", nome);
      sessionStorage.setItem("onboarding_objetivo", objetivo);
      sessionStorage.setItem("onboarding_area", areaAtuacao);

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
          <Label htmlFor="visitor-name" className="text-foreground text-sm font-medium">
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
          <Label htmlFor="visitor-email" className="text-foreground text-sm font-medium">
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
          <Label htmlFor="visitor-phone" className="text-foreground text-sm font-medium">
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
          <Label htmlFor="visitor-password" className="text-foreground text-sm font-medium">
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
          <p className="text-xs text-muted-foreground">
            Você vai usar essa senha para acessar depois
          </p>
        </div>

        {/* Objetivo */}
        <div className="space-y-2 text-left">
          <Label className="text-foreground text-sm font-medium">
            Qual seu objetivo principal?
          </Label>
          <Select value={objetivo} onValueChange={setObjetivo} required>
            <SelectTrigger className={selectTriggerClasses}>
              <SelectValue placeholder="Selecione um objetivo" />
            </SelectTrigger>
            <SelectContent className="bg-card border-brand-hairline">
              <SelectItem value="desenvolver_habilidades_ia">Desenvolver habilidades com IA</SelectItem>
              <SelectItem value="melhorar_produtividade_time">Melhorar produtividade do meu time</SelectItem>
              <SelectItem value="organizar_operacao">Organizar minha operação</SelectItem>
              <SelectItem value="explorando">Só estou explorando</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Área de atuação */}
        <div className="space-y-2 text-left">
          <Label className="text-foreground text-sm font-medium">
            Área de atuação
          </Label>
          <Select value={areaAtuacao} onValueChange={setAreaAtuacao} required>
            <SelectTrigger className={selectTriggerClasses}>
              <SelectValue placeholder="Selecione sua área" />
            </SelectTrigger>
            <SelectContent className="bg-card border-brand-hairline">
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
          <Label className="text-foreground text-sm font-medium">
            Qual seu maior desafio hoje? <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            value={desafio}
            onChange={(e) => setDesafio(e.target.value.slice(0, 200))}
            placeholder="Descreva brevemente..."
            maxLength={200}
            className="bg-background border-brand-hairline text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-primary/30 min-h-[80px] resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">{desafio.length}/200</p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-brand-strong hover:bg-brand-strong/90 text-brand-strong-foreground font-medium rounded-lg transition-all mt-2" 
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta grátis"}
        </Button>
      </form>
    </>
  );
}
