import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { useEnvironment, Environment, ENVIRONMENT_CONFIG } from "@/contexts/EnvironmentContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { IAPLogo3D } from "@/components/IAPLogo3D";
import { Button } from "@/components/ui/button";
import envGratuito from "@/assets/env-gratuito.jpg";
import envAcademy from "@/assets/env-academy.jpg";
import envBusiness from "@/assets/env-business.jpg";

// Mapeia ambiente → imagem visual (sem ícones lucide).
const ENV_IMAGE: Record<Environment, string> = {
  gratuito: envGratuito,
  academy: envAcademy,
  business_parceria: envBusiness,
  business_sistemas: envBusiness,
};

// "business_sistemas" não aparece na seleção inicial — usuários desse plano
// entram via "business_parceria" e a experiência é ajustada internamente.
const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "business_parceria"];

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

  // Estado: card sob hover/focus (efeito 21st.dev — outros borram e esmaecem)
  const [hovered, setHovered] = useState<Environment | null>(null);
  // Estado: card sendo clicado (efeito de press + brilho de saída)
  const [clicked, setClicked] = useState<Environment | null>(null);

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
    // Animação de saída: marca o clicado, aguarda o ripple/glow e navega
    setClicked(env);
    setTimeout(() => {
      setEnvironment(env);
      navigate("/", { replace: true });
    }, 420);
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
        <h1 className="font-serif-display text-3xl md:text-4xl leading-[1.05] tracking-tight text-foreground mb-3">
          Selecione seu{" "}
          <em className="font-serif-italic text-primary">ambiente</em>
        </h1>
        <p className="text-sm md:text-base font-light text-muted-foreground">
          Escolha o ambiente que deseja acessar
        </p>
      </motion.div>

      {/* Cards de Ambiente — efeito "focus blur" (estilo 21st.dev):
          ao passar o mouse num card, os outros borram e perdem opacidade,
          o card ativo cresce levemente e ganha sombra. */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 w-full max-w-2xl"
        onMouseLeave={() => setHovered(null)}
      >
        {ALL_ENVIRONMENTS.map((env, index) => {
          const config = ENVIRONMENT_CONFIG[env];
          const image = ENV_IMAGE[env];
          const isAvailable = availableEnvironments.includes(env);
          const isLocked = !isAvailable;
          const isHovered = hovered === env;
          const isDimmed = hovered !== null && !isHovered;
          const isClicked = clicked === env;

          return (
            <motion.button
              key={env}
              onClick={() => handleSelectEnvironment(env)}
              onMouseEnter={() => isAvailable && setHovered(env)}
              onFocus={() => isAvailable && setHovered(env)}
              onBlur={() => setHovered(null)}
              disabled={isLocked || clicked !== null}
              className={cn(
                "relative group flex flex-col items-center gap-3 outline-none",
                isLocked && "cursor-not-allowed"
              )}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: isDimmed ? 0.55 : 1,
                y: 0,
                scale: isHovered && isAvailable ? 1.05 : 1,
                filter: isDimmed ? "blur(4px)" : "blur(0px)",
              }}
              transition={{
                opacity: { duration: 0.4, delay: hovered ? 0 : 0.2 + index * 0.1 },
                y: { duration: 0.4, delay: 0.2 + index * 0.1 },
                scale: { type: "spring", stiffness: 260, damping: 22 },
                filter: { duration: 0.3 },
              }}
              whileTap={isAvailable ? { scale: 0.97 } : {}}
            >
              {/* Card com imagem de fundo. Borda hairline + canto arredondado
                  igual ao restante da marca. */}
              <div
                className={cn(
                  "relative w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border border-brand-hairline bg-brand-cream-soft transition-shadow duration-300",
                  !isAvailable && "opacity-60",
                  isAvailable && isHovered &&
                    "shadow-2xl shadow-foreground/15 ring-1 ring-brand-strong/30"
                )}
              >
                {/* Imagem visual do ambiente (substitui o ícone) */}
                <img
                  src={image}
                  alt={config.label}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-transform duration-500",
                    isAvailable && isHovered && "scale-110",
                    !isAvailable && "grayscale"
                  )}
                  loading="lazy"
                />

                {/* Véu creme suave para garantir que a imagem combine com a
                    paleta da marca (sem "carnaval"). */}
                <div className="absolute inset-0 bg-brand-cream-soft/35 mix-blend-luminosity" />

                {/* Gradiente sutil na base — adiciona profundidade */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/15 to-transparent" />

                {/* Lock overlay para ambientes bloqueados */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20 backdrop-blur-[2px]">
                    <div className="bg-foreground/50 rounded-full p-3">
                      <Lock className="h-5 w-5 text-background" />
                    </div>
                  </div>
                )}

                {/* Pulse de saída ao clicar — anel verde-brand expandindo */}
                <AnimatePresence>
                  {isClicked && (
                    <motion.div
                      key="ripple"
                      className="absolute inset-0 rounded-3xl bg-brand-strong/25"
                      initial={{ opacity: 0.9, scale: 0.8 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
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
