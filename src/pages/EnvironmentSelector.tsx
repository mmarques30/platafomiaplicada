import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, GraduationCap, Users, Crown, Lock, ArrowRight, ArrowLeft, LucideProps } from "lucide-react";
import { useEnvironment, Environment, ENVIRONMENT_CONFIG } from "@/contexts/EnvironmentContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import logoAplicada from "@/assets/logo-aplicada-nova.png";
import { Button } from "@/components/ui/button";

const ICONS: Record<Environment, React.ComponentType<LucideProps>> = {
  gratuito: Gift,
  academy: GraduationCap,
  skills: Users,
  business: Crown,
};

const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "skills", "business"];

export default function EnvironmentSelector() {
  const navigate = useNavigate();
  const { 
    availableEnvironments, 
    setEnvironment, 
    isLoading,
    currentEnvironment 
  } = useEnvironment();
  const { isAdmin } = useUserRole();

  // Se já tem ambiente selecionado e está carregando, aguardar
  // Se já tem ambiente selecionado e não está carregando, redirecionar
  useEffect(() => {
    if (!isLoading && currentEnvironment) {
      navigate("/", { replace: true });
    }
  }, [currentEnvironment, isLoading, navigate]);

  const handleSelectEnvironment = (env: Environment) => {
    if (!availableEnvironments.includes(env)) {
      // Ambiente bloqueado - poderia abrir modal de upgrade
      return;
    }
    
    setEnvironment(env);
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { signOut } = useAuth();

  const handleBackToAuth = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] p-6 relative">
      {/* Botão Voltar */}
      <motion.div
        className="absolute top-6 left-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToAuth}
          className="text-white/60 hover:text-white hover:bg-white/10 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Sair
        </Button>
      </motion.div>

      {/* Logo */}
      <motion.img
        src={logoAplicada}
        alt="IAplicada"
        className="h-12 md:h-16 w-auto mb-8 opacity-90"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Título */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
          Selecione seu Ambiente
        </h1>
        <p className="text-white/60 text-sm md:text-base">
          Escolha o ambiente que deseja acessar
        </p>
      </motion.div>

      {/* Cards de Ambiente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl">
        {ALL_ENVIRONMENTS.map((env, index) => {
          const config = ENVIRONMENT_CONFIG[env];
          const Icon = ICONS[env];
          const isAvailable = availableEnvironments.includes(env);
          const isLocked = !isAvailable;

          return (
            <motion.button
              key={env}
              onClick={() => handleSelectEnvironment(env)}
              disabled={isLocked}
              className={cn(
                "relative group p-6 rounded-2xl border transition-all duration-300",
                "flex flex-col items-center text-center",
                isAvailable
                  ? "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 cursor-pointer"
                  : "bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50"
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              whileHover={isAvailable ? { scale: 1.02, y: -4 } : {}}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
            >
              {/* Glow effect */}
              {isAvailable && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                  style={{ backgroundColor: config.color }}
                />
              )}

              {/* Lock icon para ambientes bloqueados */}
              {isLocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="h-4 w-4 text-white/30" />
                </div>
              )}

              {/* Ícone */}
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  isAvailable ? "bg-white/10" : "bg-white/5"
                )}
                style={isAvailable ? { backgroundColor: `${config.color}20` } : {}}
              >
                <Icon
                  className={cn(
                    "h-8 w-8 transition-colors",
                    isAvailable ? "text-white" : "text-white/30"
                  )}
                  style={isAvailable ? { color: config.color } : {}}
                />
              </div>

              {/* Nome */}
              <h3
                className={cn(
                  "text-lg font-semibold mb-2 transition-colors",
                  isAvailable ? "text-white" : "text-white/40"
                )}
              >
                {config.label}
              </h3>

              {/* Descrição */}
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  isAvailable ? "text-white/60" : "text-white/30"
                )}
              >
                {config.description}
              </p>

              {/* CTA */}
              {isAvailable ? (
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Acessar
                  <ArrowRight className="h-4 w-4" />
                </div>
              ) : (
                <div className="mt-4 text-xs text-white/30">
                  Faça upgrade para acessar
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Info para Admin */}
      {isAdmin && (
        <motion.p
          className="mt-8 text-xs text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          👑 Como admin, você tem acesso a todos os ambientes para simulação
        </motion.p>
      )}
    </div>
  );
}
