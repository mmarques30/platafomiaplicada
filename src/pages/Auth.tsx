import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AnimatedLogo } from "@/components/auth/AnimatedLogo";
import { FloatingTestimonial } from "@/components/auth/FloatingTestimonial";
import logoIaplicada from "@/assets/logo-aplicada-marca-completa-clara.png";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar usuários já autenticados
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

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
          data: {
            nome_completo: nome,
            telefone: telefone,
            is_visitante: true
          }
        }
      });

      if (error) {
        await logSignupAttempt(email, nome, telefone, false, error.message);
        throw error;
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
    <div className="min-h-screen flex">
      {/* LADO ESQUERDO: Animação + Feedbacks */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
        {/* Logo no topo */}
        <div className="absolute top-8 left-8 z-10">
          <img 
            src={logoIaplicada} 
            alt="IAplicada" 
            className="h-10 w-auto"
          />
        </div>

        {/* Logo 3D animada */}
        <AnimatedLogo />

        {/* Feedbacks rotativos */}
        <FloatingTestimonial />

        {/* Texto decorativo */}
        <div className="absolute top-1/2 left-12 -translate-y-1/2 max-w-md">
          <h2 className="text-4xl font-bold text-white/10 leading-tight">
            Transforme sua carreira com Inteligência Artificial
          </h2>
        </div>
      </div>

      {/* LADO DIREITO: Formulários */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo para mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src={logoIaplicada} 
              alt="IAplicada" 
              className="h-10 w-auto invert"
            />
          </div>

          <Tabs defaultValue="entrar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg mb-8">
              <TabsTrigger 
                value="entrar"
                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#9EB038] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600"
              >
                Acessar
              </TabsTrigger>
              <TabsTrigger 
                value="criar-conta"
                className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#9EB038] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600"
              >
                Criar Conta Grátis
              </TabsTrigger>
            </TabsList>

            {/* Aba Entrar */}
            <TabsContent value="entrar" className="mt-0">
              <div className="space-y-2 mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  Bem-vindo de volta
                </h1>
                <p className="text-gray-500 text-sm">
                  Entre com seu email e senha para acessar
                </p>
              </div>
              
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-gray-700 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    name="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-gray-700 text-sm font-medium">
                    Senha
                  </Label>
                  <PasswordInput
                    id="signin-password"
                    name="signin-password"
                    placeholder="••••••••"
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#9EB038] hover:bg-[#8a9a31] text-white font-medium rounded-lg transition-all mt-4" 
                  disabled={isLoading}
                >
                  {isLoading ? "Acessando..." : "Acessar"}
                </Button>
              </form>
            </TabsContent>

            {/* Aba Criar Conta */}
            <TabsContent value="criar-conta" className="mt-0">
              <div className="space-y-2 mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  Explore a plataforma
                </h1>
                <p className="text-gray-500 text-sm">
                  Crie uma conta grátis e conheça a comunidade IAplicada
                </p>
              </div>
              
              <form onSubmit={handleVisitorSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visitor-name" className="text-gray-700 text-sm font-medium">
                    Nome Completo
                  </Label>
                  <Input
                    id="visitor-name"
                    name="visitor-name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor-email" className="text-gray-700 text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="visitor-email"
                    name="visitor-email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitor-phone" className="text-gray-700 text-sm font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="visitor-phone"
                    name="visitor-phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    required
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visitor-password" className="text-gray-700 text-sm font-medium">
                    Crie uma senha
                  </Label>
                  <PasswordInput
                    id="visitor-password"
                    name="visitor-password"
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                  />
                  <p className="text-xs text-gray-500">
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
            </TabsContent>
          </Tabs>

          {/* Termos */}
          <p className="text-center text-xs text-gray-400 mt-8">
            Ao continuar, você concorda com nossos{" "}
            <a href="/politica-uso" className="text-[#9EB038] hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="/politica-vendas" className="text-[#9EB038] hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
