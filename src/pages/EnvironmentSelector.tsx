import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Users2, Briefcase, Lock, LucideProps, Wrench } from "lucide-react";
import { useEnvironment, Environment, ENVIRONMENT_CONFIG } from "@/contexts/EnvironmentContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { IAPLogo3D } from "@/components/IAPLogo3D";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ICONS: Record<Environment, React.ComponentType<LucideProps>> = {
  gratuito: Sparkles,
  academy: BookOpen,
  skills: Users2,
  business_parceria: Briefcase,
  business_sistemas: Wrench,
};

// "business_sistemas" não aparece na seleção inicial — usuários desse plano
// entram via "business_parceria" e a experiência é ajustada internamente.
const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "skills", "business_parceria"];

export default function EnvironmentSelector() {
  const navigate = useNavigate();
  const { signOut, user, loading: authLoading } = useAuth();
  const {
    availableEnvironments,
    setEnvironment,
    isLoading,
    currentEnvironment,
  } = useEnvironment();
  const { isAdmin } = useUserRole();

  // Guard: redirecionar para /auth se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!isLoading && currentEnvironment) {
      navigate("/", { replace: true });
    }
  }, [currentEnvironment, isLoading, navigate]);

  const handleSelectEnvironment = (env: Environment) => {
    if (!availableEnvironments.includes(env)) {
      return;
    }
    
    setEnvironment(env);
    navigate("/", { replace: true });
  };

  const handleBackToAuth = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-strong"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative">
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
          className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Sair
        </Button>
      </motion.div>

      {/* Logo 3D */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="-mb-4 w-[300px] h-[300px] flex items-center justify-center"
      >
        <IAPLogo3D width={300} height={300} scale={1.2} />
      </motion.div>

      {/* Título */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
          IAplicada · Ambientes
        </p>
        <h1 className="font-serif-display text-3xl md:text-4xl leading-[1.05] tracking-tight text-foreground mb-3">
          Selecione seu{" "}
          <em className="font-serif-italic text-primary">ambiente</em>
        </h1>
        <p className="text-sm md:text-base font-light text-muted-foreground">
          Escolha o ambiente que deseja acessar
        </p>
      </motion.div>

      {/* Cards de Ambiente */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12 w-full max-w-3xl">
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
                "relative group flex flex-col items-center gap-3",
                isLocked && "cursor-not-allowed"
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              whileHover={isAvailable ? { scale: 1.05, y: -4 } : {}}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
            >
              {/* Card uniforme em creme — sem "carnaval" de cores. Apenas o
                  ícone diferencia cada ambiente. Hover: borda brand-strong +
                  ícone cresce + shadow sutil. */}
              <div
                className={cn(
                  "relative w-40 h-40 md:w-48 md:h-48 rounded-3xl border border-brand-hairline bg-brand-cream-soft transition-all duration-300 flex items-center justify-center",
                  !isAvailable && "opacity-60",
                  isAvailable &&
                    "group-hover:border-brand-strong/50 group-hover:shadow-xl group-hover:shadow-foreground/5"
                )}
              >
                {/* Lock overlay para ambientes bloqueados */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-foreground/40 backdrop-blur-[2px] rounded-full p-3">
                      <Lock className="h-5 w-5 text-background" />
                    </div>
                  </div>
                )}

                {/* Ícone grande em brand-strong (verde escuro brand) */}
                <Icon
                  className={cn(
                    "h-12 w-12 md:h-14 md:w-14 transition-transform",
                    isAvailable
                      ? "text-brand-strong group-hover:scale-110"
                      : "text-muted-foreground/40"
                  )}
                  strokeWidth={1.25}
                />
              </div>

              {/* Título abaixo do card */}
              <span
                className={cn(
                  "text-sm md:text-base font-medium transition-colors",
                  isAvailable
                    ? "text-foreground group-hover:text-brand-strong"
                    : "text-muted-foreground/60"
                )}
              >
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
