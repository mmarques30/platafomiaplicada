import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

// Imagens do carrossel
import authImage1 from "@/assets/auth-carousel-1.png";
import authImage2 from "@/assets/auth-carousel-2.png";
import authImage3 from "@/assets/auth-carousel-3.png";
import authImage4 from "@/assets/auth-carousel-4.png";

const carouselImages = [authImage1, authImage2, authImage3, authImage4];

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Carrossel indicators
  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#0a0a0a]">
      <div className="w-full max-w-5xl">
        {/* Card principal dividido */}
        <Card className="flex flex-col lg:flex-row overflow-hidden bg-[#1a1a1a] border-[#2a2a2a] rounded-3xl shadow-2xl">
          
          {/* LADO ESQUERDO: Formulário */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 lg:p-12">
            <Tabs defaultValue="entrar" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] p-1 rounded-lg mb-6">
                <TabsTrigger 
                  value="entrar"
                  className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#9EB038] data-[state=active]:text-[#1a1a1a] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#888]"
                >
                  Acessar
                </TabsTrigger>
                <TabsTrigger 
                  value="criar-conta"
                  className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-[#9EB038] data-[state=active]:text-[#1a1a1a] data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#888]"
                >
                  Criar Conta Grátis
                </TabsTrigger>
              </TabsList>

              {/* Aba Entrar */}
              <TabsContent value="entrar" className="mt-0">
                <div className="space-y-2 mb-6">
                  <h1 className="text-2xl md:text-3xl font-semibold text-white">
                    Bem vindo de volta
                  </h1>
                  <p className="text-[#888] text-sm">
                    Entre com seu email e senha para acessar
                  </p>
                </div>
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-[#ccc] text-sm">
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#666] h-11 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-[#ccc] text-sm">
                      Senha
                    </Label>
                    <PasswordInput
                      id="signin-password"
                      name="signin-password"
                      placeholder="••••••••"
                      required
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#666] h-11 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-[#9EB038] hover:bg-[#b5c73f] text-[#1a1a1a] font-semibold rounded-lg transition-all mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Acessando..." : "Acessar"}
                  </Button>
                </form>
              </TabsContent>

              {/* Aba Criar Conta */}
              <TabsContent value="criar-conta" className="mt-0">
                <div className="space-y-2 mb-6">
                  <h1 className="text-2xl md:text-3xl font-semibold text-white">
                    Explore a plataforma
                  </h1>
                  <p className="text-[#888] text-sm">
                    Crie uma conta grátis e conheça a comunidade IAplicada
                  </p>
                </div>
                
                <form onSubmit={handleVisitorSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visitor-name" className="text-[#ccc] text-sm">
                      Nome Completo
                    </Label>
                    <Input
                      id="visitor-name"
                      name="visitor-name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#666] h-11 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visitor-email" className="text-[#ccc] text-sm">
                      Email
                    </Label>
                    <Input
                      id="visitor-email"
                      name="visitor-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#666] h-11 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visitor-phone" className="text-[#ccc] text-sm">
                      Telefone
                    </Label>
                    <Input
                      id="visitor-phone"
                      name="visitor-phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      required
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#666] h-11 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="visitor-password" className="text-[#ccc] text-sm">
                      Crie uma senha
                    </Label>
                    <PasswordInput
                      id="visitor-password"
                      name="visitor-password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-[#666] h-11 rounded-lg focus:border-[#9EB038] focus:ring-[#9EB038]/20"
                    />
                    <p className="text-xs text-[#666]">
                      Você vai usar essa senha para acessar depois
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-[#9EB038] hover:bg-[#b5c73f] text-[#1a1a1a] font-semibold rounded-lg transition-all mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta grátis"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* LADO DIREITO: Carrossel de Imagens */}
          <div className="hidden lg:flex w-1/2 relative bg-[#242424] items-center justify-center">
            <Carousel
              setApi={setApi}
              opts={{ loop: true, align: "center" }}
              plugins={[
                Autoplay({ delay: 4000, stopOnInteraction: false })
              ]}
              className="w-full h-full"
            >
              <CarouselContent className="h-full ml-0">
                {carouselImages.map((img, index) => (
                  <CarouselItem key={index} className="pl-0 h-full flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center p-12">
                      <img 
                        src={img} 
                        alt="" 
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Indicadores de slide */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    current === index 
                      ? "w-6 bg-[#9EB038]" 
                      : "w-2 bg-white/30 hover:bg-white/50"
                  )}
                />
              ))}
            </div>
          </div>
          
        </Card>
      </div>
    </div>
  );
}
