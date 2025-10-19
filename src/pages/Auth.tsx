import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoAplicada from "@/assets/logo-aplicada.png";
import authBackground from "@/assets/auth-background.png";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Cadastro público desabilitado - apenas admins podem criar usuários via /admin/usuarios/cadastrar

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
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Hero Section - 60% */}
      <div className="hidden lg:flex lg:w-[60%] relative items-center justify-center overflow-hidden bg-[#2F302B]">
        {/* Grid pattern com acento verde */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#738925_1px,transparent_1px),linear-gradient(to_bottom,#738925_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
        
        {/* Glow verde sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#9EB03820_0%,transparent_70%)]" />
        
        {/* Conteúdo Hero */}
        <div className="relative z-10 max-w-2xl px-12 animate-fade-in">
          {/* Barra verde de acento */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-48 bg-gradient-to-b from-transparent via-[#9EB038] to-transparent opacity-60" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9EB038]/15 border border-[#9EB038]/30 mb-8">
            <img src={logoAplicada} alt="IAplicada" className="h-5 w-auto opacity-90" />
            <span className="text-sm font-medium text-[#BCC95D]">Inteligência em ação</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 leading-tight text-[#F2F2F2]">
            IA que você
            <span className="block text-[#9EB038]">
              usa hoje
            </span>
          </h1>
          
          <p className="text-2xl font-semibold text-[#AFC040] mb-6">
            Do raciocínio à ação
          </p>
          
          <p className="text-xl text-[#F2F2F2]/80 mb-8 leading-relaxed">
            Ganhe horas por semana aplicando IA no seu fluxo real. 
            <span className="block mt-2">
              Casos práticos, ferramentas certas e entregáveis na mesma sessão.
            </span>
          </p>
          
          <p className="text-lg font-semibold text-[#9EB038]">
            #menoshypemaisentrega
          </p>
        </div>
      </div>

      {/* Form Section - 40% */}
      <div className="w-full lg:w-[40%] relative flex items-center justify-center border-l border-border p-4 overflow-hidden">
        {/* Background image com transparência */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-125"
          style={{ backgroundImage: `url(${authBackground})` }}
        />
        
        {/* Overlay escuro para garantir legibilidade */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        
        {/* Card (conteúdo) */}
        <Card className="relative z-10 w-full max-w-lg bg-card/60 backdrop-blur-lg border-border animate-slide-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-foreground">
              Bem-vindo à Aplicada
            </CardTitle>
            <CardDescription>
              Entre com sua conta para acessar o conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input
                      id="signin-password"
                      name="signin-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full glow-primary" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
