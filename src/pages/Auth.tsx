import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background animado */}
      <AnimatedBackground />
      
      {/* Header flutuante */}
      <AuthHeader />
      
      {/* Conteúdo central */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md text-center"
        >
          {/* Título */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            Bem Vindo Aplicado
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-white/60 mb-8"
          >
            acesse e aplique
          </motion.p>
          
          {/* Card com sub-abas */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl p-6"
          >
            {/* Sub-abas discretas */}
            <div className="flex justify-center gap-8 mb-6 border-b border-white/10 pb-4">
              <button
                onClick={() => setActiveTab("login")}
                className={cn(
                  "text-sm font-medium transition-all duration-300 pb-2 border-b-2 -mb-[17px]",
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
                  "text-sm font-medium transition-all duration-300 pb-2 border-b-2 -mb-[17px]",
                  activeTab === "signup" 
                    ? "text-white border-[#9EB038]" 
                    : "text-white/50 border-transparent hover:text-white/70"
                )}
              >
                Criar Conta
              </button>
            </div>
            
            {/* Formulário com animação */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "login" ? <LoginForm /> : <SignupForm />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          
          {/* Termos */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="text-xs text-white/40 mt-6"
          >
            Ao continuar, você concorda com nossos{" "}
            <a href="/termos-uso" className="text-[#9EB038] hover:underline">
              Termos
            </a>{" "}
            e{" "}
            <a href="/politica-privacidade" className="text-[#9EB038] hover:underline">
              Privacidade
            </a>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
