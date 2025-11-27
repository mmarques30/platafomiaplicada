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
import logoAplicada from "@/assets/logo-aplicada-nova.png";
import logoMarcaCompleta from "@/assets/logo-auth-fundo-escuro.png";
import authBackground from "@/assets/auth-background-new.png";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisitorSignup, setIsVisitorSignup] = useState(true);

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

  const handleVisitorAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("visitor-email") as string;
    const password = formData.get("visitor-password") as string;

    try {
      if (isVisitorSignup) {
        // Cadastro de visitante
        const nome = formData.get("visitor-name") as string;
        const telefone = formData.get("visitor-phone") as string;

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

        if (error) throw error;
        toast.success("Cadastro realizado! Bem-vindo à IAplicada!");
      } else {
        // Login de visitante
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-8 py-8 lg:px-24">
      {/* Background com overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
      />
      <div className="absolute inset-0 bg-[#2F302B]/70 backdrop-blur-sm" />
      
      {/* Conteúdo centralizado */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-6">
      {/* Logo */}
      <img 
        src={logoMarcaCompleta} 
        alt="IAplicada" 
        className="h-10 md:h-12 w-auto" 
      />

        {/* Card de Auth com altura mínima fixa */}
        <Card className="w-full min-h-[420px] bg-[#2F302B]/90 border-[#9EB038]/20 shadow-2xl backdrop-blur-md">
          <Tabs defaultValue="aplicados" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a] p-1 rounded-lg mb-4">
            <TabsTrigger 
              value="aplicados"
              className="rounded-md data-[state=active]:bg-[#9EB038] data-[state=active]:text-[#2F302B] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#F2F2F2]/60"
            >
              Aplicados
            </TabsTrigger>
            <TabsTrigger 
              value="visitantes"
              className="rounded-md data-[state=active]:bg-[#9EB038] data-[state=active]:text-[#2F302B] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#F2F2F2]/60"
            >
              Visitantes
            </TabsTrigger>
          </TabsList>

            {/* Aba Aplicados */}
            <TabsContent value="aplicados">
              <CardHeader className="space-y-1 p-6 pt-0 text-center">
                <CardTitle className="text-2xl lg:text-2xl font-bold text-[#F2F2F2] text-center">
                  Pronto para aplicar?
                </CardTitle>
                <CardDescription className="text-[#F2F2F2]/60 text-center">
                  Faça login para continuar aplicando IA no seu fluxo real
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-[#F2F2F2]">Email</Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="bg-[#1a1a1a] border-[#9EB038]/30 text-[#F2F2F2] placeholder:text-[#F2F2F2]/40"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password" className="text-[#F2F2F2]">Senha</Label>
                    <PasswordInput
                      id="signin-password"
                      name="signin-password"
                      placeholder="••••••••"
                      required
                      className="bg-[#1a1a1a] border-[#9EB038]/30 text-[#F2F2F2] placeholder:text-[#F2F2F2]/40"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9EB038] hover:bg-[#AFC040] text-[#2F302B] font-semibold" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Aba Visitantes */}
            <TabsContent value="visitantes">
              <CardHeader className="space-y-1 p-6 pt-0 text-center">
                <CardTitle className="text-2xl lg:text-2xl font-bold text-[#F2F2F2] text-center">
                  {isVisitorSignup ? "Explore a plataforma" : "Bem-vindo de volta"}
                </CardTitle>
                <CardDescription className="text-[#F2F2F2]/60 text-center">
                  {isVisitorSignup 
                    ? "Crie uma conta grátis e conheça a comunidade IAplicada" 
                    : "Acesse sua conta de visitante"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleVisitorAuth} className="space-y-4">
                  {isVisitorSignup && (
                    <div className="space-y-1.5">
                      <Label htmlFor="visitor-name" className="text-[#F2F2F2]">Nome Completo</Label>
                      <Input
                        id="visitor-name"
                        name="visitor-name"
                        type="text"
                        placeholder="Seu nome"
                        required
                        className="bg-[#1a1a1a] border-[#9EB038]/30 text-[#F2F2F2] placeholder:text-[#F2F2F2]/40"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="visitor-email" className="text-[#F2F2F2]">Email</Label>
                    <Input
                      id="visitor-email"
                      name="visitor-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="bg-[#1a1a1a] border-[#9EB038]/30 text-[#F2F2F2] placeholder:text-[#F2F2F2]/40"
                    />
                  </div>

                  {isVisitorSignup && (
                    <div className="space-y-1.5">
                      <Label htmlFor="visitor-phone" className="text-[#F2F2F2]">Telefone</Label>
                      <Input
                        id="visitor-phone"
                        name="visitor-phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        required
                        className="bg-[#1a1a1a] border-[#9EB038]/30 text-[#F2F2F2] placeholder:text-[#F2F2F2]/40"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="visitor-password" className="text-[#F2F2F2]">
                      {isVisitorSignup ? "Crie uma senha simples" : "Senha"}
                    </Label>
                    <PasswordInput
                      id="visitor-password"
                      name="visitor-password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="bg-[#1a1a1a] border-[#9EB038]/30 text-[#F2F2F2] placeholder:text-[#F2F2F2]/40"
                    />
                    {isVisitorSignup && (
                      <p className="text-xs text-[#F2F2F2]/50">
                        Você vai usar essa senha para acessar depois
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#9EB038] hover:bg-[#AFC040] text-[#2F302B] font-semibold" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : (isVisitorSignup ? "Criar conta grátis" : "Entrar")}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsVisitorSignup(!isVisitorSignup)}
                    className="w-full text-sm text-[#9EB038] hover:underline"
                  >
                    {isVisitorSignup ? "Já tenho conta" : "Primeiro acesso"}
                  </button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

      {/* Tagline */}
      <div className="text-center">
        <p className="text-lg text-[#F2F2F2]/80">
          IA só tem valor quando se aplica.
        </p>
        <p className="text-lg font-semibold text-[#9EB038] mt-2">
          #menoshypemaisentrega
        </p>
      </div>
      </div>
    </div>
  );
}
