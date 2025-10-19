import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logoAplicada from "@/assets/logo-aplicada.png";
import authBackground from "@/assets/auth-background-new.png";

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
    <div className="min-h-screen relative flex flex-col items-center justify-between px-8 py-12 lg:px-24">
      {/* Background com overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
      />
      <div className="absolute inset-0 bg-[#2F302B]/70 backdrop-blur-sm" />
      
      {/* Conteúdo */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen gap-8">
        {/* TOPO - Branding (oculto no mobile) */}
        <div className="hidden lg:flex flex-col items-center text-center w-full px-8">
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#9EB038]/15 border border-[#9EB038]/30 mb-6 mx-auto">
            <img src={logoAplicada} alt="IAplicada" className="h-5 w-auto opacity-90" />
            <span className="text-sm font-medium text-[#BCC95D]">Inteligência em ação</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-3 leading-tight text-[#F2F2F2]">
            IA que você <span className="text-[#9EB038]">usa hoje</span>
          </h1>
          
          <p className="text-xl lg:text-2xl font-semibold text-[#AFC040]">
            Do raciocínio à ação
          </p>
        </div>

        {/* Logo mobile - visível apenas em telas pequenas */}
        <div className="lg:hidden mb-8">
          <img src={logoAplicada} alt="IAplicada" className="h-8 w-auto mx-auto" />
        </div>

        {/* CENTRO - Card de Login */}
        <Card className="w-full max-w-xl bg-[#2F302B]/90 border-[#9EB038]/20 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1 p-8 text-center">
            <CardTitle className="text-2xl lg:text-3xl font-bold text-[#F2F2F2] text-center">
              Bem-vindo à Aplicada
            </CardTitle>
            <CardDescription className="text-[#F2F2F2]/60 text-center">
              Entre com sua conta para acessar o conteúdo
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
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
                <Input
                  id="signin-password"
                  name="signin-password"
                  type="password"
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
        </Card>

        {/* DESCRIÇÃO - Abaixo do card (oculto no mobile) */}
        <div className="hidden lg:block text-center max-w-3xl px-8">
          <p className="text-lg lg:text-xl text-[#F2F2F2]/80 leading-relaxed">
            Ganhe horas por semana aplicando IA no seu fluxo real.
          </p>
        </div>

        {/* RODAPÉ - Hashtag (oculto no mobile) */}
        <div className="hidden lg:block w-full text-center">
          <p className="text-lg font-semibold text-[#9EB038]">
            #menoshypemaisentrega
          </p>
        </div>
      </div>
    </div>
  );
}
