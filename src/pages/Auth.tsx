import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoFaixaSimbolos from "@/assets/logo-faixa-simbolos.png";

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
        // Registrar tentativa falha
        await logSignupAttempt(email, nome, telefone, false, error.message);
        throw error;
      }
      
      // Registrar tentativa bem-sucedida
      await logSignupAttempt(email, nome, telefone, true);
      toast.success("Cadastro realizado! Bem-vindo à IAplicada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-8 lg:px-24 bg-[#F8F8F6]">
      {/* Conteúdo centralizado */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-6">
        {/* Faixa de símbolos acima do card */}
        <img 
          src={logoFaixaSimbolos} 
          alt="IAplicada" 
          className="h-12 md:h-16 w-auto" 
        />

        {/* Card de Auth semi-transparente */}
        <Card className="w-full min-h-[420px] bg-white/60 backdrop-blur-md border-[#9EB038]/30 shadow-2xl">
          <Tabs defaultValue="entrar" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#E8E8E4] p-1 rounded-lg mb-4">
              <TabsTrigger 
                value="entrar"
                className="rounded-md data-[state=active]:bg-[#9EB038] data-[state=active]:text-[#2F302B] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#2F302B]/60"
              >
                Acessar
              </TabsTrigger>
              <TabsTrigger 
                value="criar-conta"
                className="rounded-md data-[state=active]:bg-[#9EB038] data-[state=active]:text-[#2F302B] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#2F302B]/60"
              >
                Criar Conta Grátis
              </TabsTrigger>
            </TabsList>

            {/* Aba Entrar - Para todos os usuários (aplicados e visitantes) */}
            <TabsContent value="entrar">
              <CardHeader className="space-y-1 p-6 pt-0 text-center">
                <CardTitle className="text-2xl lg:text-2xl font-bold text-[#2F302B] text-center">
                  Bem Vindo Aplicado
                </CardTitle>
                <CardDescription className="text-[#2F302B]/70 text-center">
                  Entre com seu email e senha
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-[#2F302B]">Email</Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="bg-white/70 border-[#9EB038]/40 text-[#2F302B] placeholder:text-[#2F302B]/40"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password" className="text-[#2F302B]">Senha</Label>
                    <PasswordInput
                      id="signin-password"
                      name="signin-password"
                      placeholder="••••••••"
                      required
                      className="bg-white/70 border-[#9EB038]/40 text-[#2F302B] placeholder:text-[#2F302B]/40"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9EB038] hover:bg-[#AFC040] text-[#2F302B] font-semibold" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Acessando..." : "Acessar"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Aba Criar Conta - Apenas para novos visitantes */}
            <TabsContent value="criar-conta">
              <CardHeader className="space-y-1 p-6 pt-0 text-center">
                <CardTitle className="text-2xl lg:text-2xl font-bold text-[#2F302B] text-center">
                  Explore a plataforma
                </CardTitle>
                <CardDescription className="text-[#2F302B]/70 text-center">
                  Crie uma conta grátis e conheça a comunidade IAplicada
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleVisitorSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="visitor-name" className="text-[#2F302B]">Nome Completo</Label>
                    <Input
                      id="visitor-name"
                      name="visitor-name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      className="bg-white/70 border-[#9EB038]/40 text-[#2F302B] placeholder:text-[#2F302B]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="visitor-email" className="text-[#2F302B]">Email</Label>
                    <Input
                      id="visitor-email"
                      name="visitor-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="bg-white/70 border-[#9EB038]/40 text-[#2F302B] placeholder:text-[#2F302B]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="visitor-phone" className="text-[#2F302B]">Telefone</Label>
                    <Input
                      id="visitor-phone"
                      name="visitor-phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      required
                      className="bg-white/70 border-[#9EB038]/40 text-[#2F302B] placeholder:text-[#2F302B]/40"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="visitor-password" className="text-[#2F302B]">
                      Crie uma senha simples
                    </Label>
                    <PasswordInput
                      id="visitor-password"
                      name="visitor-password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="bg-white/70 border-[#9EB038]/40 text-[#2F302B] placeholder:text-[#2F302B]/40"
                    />
                    <p className="text-xs text-[#2F302B]/50">
                      Você vai usar essa senha para acessar depois
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9EB038] hover:bg-[#AFC040] text-[#2F302B] font-semibold" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta grátis"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
