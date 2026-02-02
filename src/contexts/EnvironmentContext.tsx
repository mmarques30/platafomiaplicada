import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";

export type Environment = "gratuito" | "academy" | "skills" | "business" | "business_iaplicada";

interface EnvironmentContextType {
  currentEnvironment: Environment | null;
  setEnvironment: (env: Environment) => void;
  availableEnvironments: Environment[];
  isEnvironmentSelected: boolean;
  isLoading: boolean;
  environmentConfig: {
    label: string;
    icon: string;
    color: string;
    description: string;
  } | null;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const ENVIRONMENT_CONFIG: Record<Environment, {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  gratuito: {
    label: "Gratuito",
    icon: "Gift",
    color: "hsl(142, 76%, 36%)",
    description: "Explore conteúdos gratuitos e a comunidade",
  },
  academy: {
    label: "Academy",
    icon: "GraduationCap",
    color: "hsl(73, 55%, 46%)", // #9EB038
    description: "Trilhas completas + diagnóstico + evolução",
  },
  skills: {
    label: "Skills",
    icon: "Users",
    color: "hsl(217, 91%, 60%)",
    description: "Academy + capacitação para equipes",
  },
  business: {
    label: "Business",
    icon: "Crown",
    color: "hsl(45, 93%, 47%)",
    description: "Academy + mentoria 1:1 + roadmap",
  },
  business_iaplicada: {
    label: "Business iAplicada",
    icon: "Wrench",
    color: "hsl(45, 93%, 47%)",
    description: "Acompanhamento de projeto - iAplicada constrói",
  },
};

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(() => {
    return sessionStorage.getItem("selected_environment") as Environment | null;
  });
  
  const { plan, isVisitante, isLoading: planLoading, skillsLiberado } = useUserPlan();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  
  const isLoading = planLoading || roleLoading;

  // Determinar ambientes disponíveis baseado no plano
  const availableEnvironments = useMemo<Environment[]>(() => {
    // Admin vê todos para simulação
    if (isAdmin) {
      return ["gratuito", "academy", "skills", "business"];
    }
    
    // Visitante só vê gratuito
    if (isVisitante) {
      return ["gratuito"];
    }
    
    // Baseado no plano - hierarquia paralela
    switch (plan) {
      case "business":
        // Business sempre tem academy, e skills só se liberado
        return skillsLiberado 
          ? ["gratuito", "academy", "skills", "business"]
          : ["gratuito", "academy", "business"];
      case "business_iaplicada":
        // IAplicada entra pelo ambiente "business", identificação interna determina o que vê
        return skillsLiberado 
          ? ["gratuito", "academy", "skills", "business"]
          : ["gratuito", "academy", "business"];
      case "skills":
        return ["gratuito", "academy", "skills"];
      case "academy":
        return ["gratuito", "academy"];
      default:
        return ["gratuito"];
    }
  }, [plan, isVisitante, isAdmin, skillsLiberado]);

  const setEnvironment = (env: Environment) => {
    setCurrentEnvironment(env);
    sessionStorage.setItem("selected_environment", env);
  };

  // Validar se o ambiente atual ainda é válido quando os ambientes disponíveis mudam
  useEffect(() => {
    if (!isLoading && currentEnvironment && !availableEnvironments.includes(currentEnvironment)) {
      // Ambiente atual não é mais válido, limpar
      setCurrentEnvironment(null);
      sessionStorage.removeItem("selected_environment");
    }
  }, [availableEnvironments, currentEnvironment, isLoading]);

  const environmentConfig = currentEnvironment ? ENVIRONMENT_CONFIG[currentEnvironment] : null;

  return (
    <EnvironmentContext.Provider
      value={{
        currentEnvironment,
        setEnvironment,
        availableEnvironments,
        isEnvironmentSelected: currentEnvironment !== null,
        isLoading,
        environmentConfig,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error("useEnvironment must be used within an EnvironmentProvider");
  }
  return context;
}

// Hook opcional para usar sem throw - útil em componentes que podem estar fora do provider
export function useEnvironmentSafe() {
  return useContext(EnvironmentContext);
}
