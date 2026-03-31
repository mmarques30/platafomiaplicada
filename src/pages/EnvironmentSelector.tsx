import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, GraduationCap, Users, Crown, Lock, LucideProps, Wrench } from "lucide-react";
import { useEnvironment, Environment, ENVIRONMENT_CONFIG } from "@/contexts/EnvironmentContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import logoAplicada from "@/assets/logo-aplicada-nova.png";
import envBusinessImage from "@/assets/env-business.jpg";
import envSkillsImage from "@/assets/env-skills.jpg";
import envAcademyImage from "@/assets/env-academy.jpg";
import envGratuitoImage from "@/assets/env-gratuito.jpg";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ICONS: Record<Environment, React.ComponentType<LucideProps>> = {
  gratuito: Gift,
  academy: GraduationCap,
  skills: Users,
  business_parceria: Crown,
  business_sistemas: Wrench,
};

const ENVIRONMENT_IMAGES: Partial<Record<Environment, string>> = {
  gratuito: envGratuitoImage,
  academy: envAcademyImage,
  skills: envSkillsImage,
  business_parceria: envBusinessImage,
  business_sistemas: envBusinessImage, // Usa mesma imagem do business
};

// Importante: o ambiente "business_sistemas" não deve aparecer na seleção inicial.
// Usuários desse plano entram via "business_parceria" e a experiência é ajustada por identificação interna.
const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "skills", "business_parceria"];

export default function EnvironmentSelector() {
  const navigate = useNavigate();
  const { signOut, user, loading: authLoading } = useAuth();
  const { 
    availableEnvironments, 
    setEnvironment, 
    isLoading,
    currentEnvironment 
  } = useEnvironment();
  const { isAdmin } = useUserRole();

  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Preload images
  useEffect(() => {
    const images = [envBusinessImage, envSkillsImage, envAcademyImage, envGratuitoImage];
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

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

  const handleImageLoad = (env: Environment) => {
    setLoadedImages(prev => new Set(prev).add(env));
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        className="text-center mb-12"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12 w-full max-w-3xl">
        {ALL_ENVIRONMENTS.map((env, index) => {
          const config = ENVIRONMENT_CONFIG[env];
          const Icon = ICONS[env];
          const isAvailable = availableEnvironments.includes(env);
          const isLocked = !isAvailable;
          const hasImage = ENVIRONMENT_IMAGES[env];

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
              {/* Card com imagem ou ícone */}
              <div
                className={cn(
                  "relative w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden transition-all duration-300",
                  !isAvailable && "opacity-40"
                )}
              >
                {/* Glow effect */}
                {isAvailable && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl z-0"
                    style={{ backgroundColor: config.color }}
                  />
                )}

                {/* Lock overlay para ambientes bloqueados - visual clean */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-black/30 backdrop-blur-[2px] rounded-full p-3">
                      <Lock className="h-5 w-5 text-white/60" />
                    </div>
                  </div>
                )}

                {/* Conteúdo do card */}
                {hasImage ? (
                  <>
                    {!loadedImages.has(env) && (
                      <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    )}
                    <img
                      src={ENVIRONMENT_IMAGES[env]}
                      alt={config.label}
                      onLoad={() => handleImageLoad(env)}
                      className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        loadedImages.has(env) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </>
                ) : (
                  <div
                    className={cn(
                      "w-full h-full flex items-center justify-center",
                      isAvailable ? "bg-white/5" : "bg-white/[0.02]"
                    )}
                    style={isAvailable ? { backgroundColor: `${config.color}15` } : {}}
                  >
                    <Icon
                      className={cn(
                        "h-10 w-10 md:h-12 md:w-12 transition-colors",
                        isAvailable ? "text-white" : "text-white/30"
                      )}
                      style={isAvailable ? { color: config.color } : {}}
                    />
                  </div>
                )}
              </div>

              {/* Título abaixo do card */}
              <span
                className={cn(
                  "text-sm md:text-base font-medium transition-colors",
                  isAvailable ? "text-white" : "text-white/40"
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
