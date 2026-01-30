import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "@/components/auth/AnimatedBackground";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Redirecionar usuários já autenticados para seleção de ambiente
  useEffect(() => {
    if (!loading && user) {
      navigate("/selecionar-ambiente");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background animado */}
      <AnimatedBackground />
      
      {/* Header */}
      <AuthHeader />
      
      {/* Conteúdo central */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-8">
        <div className="w-full max-w-md text-center">
          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Bem Vindo Aplicado
          </h1>
          <p className="text-white/60 mb-8">
            acesse e aplique
          </p>
          
          {/* Card com sub-abas */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            {/* Sub-abas discretas */}
            <div className="flex justify-center gap-8 mb-6 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab("login")}
                className={cn(
                  "text-sm font-medium transition-colors pb-2 border-b-2 -mb-[17px]",
                  activeTab === "login" 
                    ? "text-white border-[#9EB038]" 
                    : "text-white/50 border-transparent hover:text-white/70"
                )}
              >
                Entrar
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={cn(
                  "text-sm font-medium transition-colors pb-2 border-b-2 -mb-[17px]",
                  activeTab === "signup" 
                    ? "text-white border-[#9EB038]" 
                    : "text-white/50 border-transparent hover:text-white/70"
                )}
              >
                Criar Conta
              </button>
            </div>
            
            {/* Formulário */}
            {activeTab === "login" ? <LoginForm /> : <SignupForm />}
          </div>
          
          {/* Termos */}
          <p className="text-xs text-white/40 mt-6">
            Ao continuar, você concorda com nossos{" "}
            <a href="/termos-uso" className="text-[#9EB038] hover:underline">
              Termos
            </a>{" "}
            e{" "}
            <a href="/politica-privacidade" className="text-[#9EB038] hover:underline">
              Privacidade
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
