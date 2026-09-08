import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useUserPlan, type UserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

export type Environment = "gratuito" | "academy" | "business_parceria" | "business_sistemas";

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

const STORAGE_KEY = "selected_environment";
const STORAGE_OWNER_KEY = "selected_environment_user";

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
  business_parceria: {
    label: "Builder",
    icon: "Crown",
    color: "hsl(45, 93%, 47%)",
    description: "Academy + mentoria 1:1 + roadmap",
  },
  business_sistemas: {
    label: "System",
    icon: "Wrench",
    color: "hsl(45, 93%, 47%)",
    description: "Acompanhamento de projeto - iAplicada constrói",
  },
};

/** Ordem de preferência quando o plano não aponta um ambiente específico. */
const ENVIRONMENT_PRIORITY: Environment[] = ["business_sistemas", "business_parceria", "academy", "gratuito"];

/**
 * Resolve o ambiente em que o usuário entra automaticamente após o login.
 *
 * Não existe mais tela de seleção: o ambiente é o do plano contratado
 * (System, Builder ou Academy). Sem plano → Gratuito. Admin sem plano cai
 * no Builder, o mesmo padrão que a sidebar já assumia ao inferir pelo
 * plano efetivo.
 */
function resolveDefaultEnvironment(
  availableEnvironments: Environment[],
  plan: UserPlan,
  isAdmin: boolean,
): Environment {
  const planEnvironment: Environment | null =
    plan === "business_sistemas"
      ? "business_sistemas"
      : plan === "business_parceria"
        ? "business_parceria"
        : plan === "academy" || plan === "skills"
          ? "academy"
          : null;

  if (planEnvironment && availableEnvironments.includes(planEnvironment)) {
    return planEnvironment;
  }
  if (isAdmin && availableEnvironments.includes("business_parceria")) {
    return "business_parceria";
  }
  return ENVIRONMENT_PRIORITY.find((env) => availableEnvironments.includes(env)) ?? "gratuito";
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(() => {
    return sessionStorage.getItem(STORAGE_KEY) as Environment | null;
  });

  const { user } = useAuth();
  const { plan, isVisitante, isLoading: planLoading } = useUserPlan();
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  const isLoading = planLoading || roleLoading;

  // Determinar ambientes disponíveis baseado no plano
  const availableEnvironments = useMemo<Environment[]>(() => {
    // Admin vê todos para simulação
    if (isAdmin) {
      return ["gratuito", "academy", "business_parceria", "business_sistemas"];
    }

    // Visitante só vê gratuito
    if (isVisitante) {
      return ["gratuito"];
    }

    // Baseado no plano - hierarquia paralela
    switch (plan) {
      case "business_parceria":
        // Builder: ambiente próprio + acesso ao Academy
        return ["gratuito", "academy", "business_parceria"];
      case "business_sistemas":
        // System: ambiente próprio (entrada separada do Builder) + acesso ao Academy
        return ["gratuito", "academy", "business_sistemas"];
      case "skills":
        // Plano legado "skills" não tem mais ambiente próprio: cai no Academy
        return ["gratuito", "academy"];
      case "academy":
        return ["gratuito", "academy"];
      default:
        return ["gratuito"];
    }
  }, [plan, isVisitante, isAdmin]);

  const setEnvironment = (env: Environment) => {
    setCurrentEnvironment(env);
    sessionStorage.setItem(STORAGE_KEY, env);
  };

  const clearEnvironment = () => {
    setCurrentEnvironment(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Ambiente guardado na sessão pertence a um usuário: se outro usuário
  // entrar na mesma aba, descartar a escolha anterior.
  useEffect(() => {
    if (!user) return;
    const owner = sessionStorage.getItem(STORAGE_OWNER_KEY);
    if (owner && owner !== user.id) {
      clearEnvironment();
    }
    sessionStorage.setItem(STORAGE_OWNER_KEY, user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Validar se o ambiente atual ainda é válido quando os ambientes disponíveis mudam
  useEffect(() => {
    if (!isLoading && currentEnvironment && !availableEnvironments.includes(currentEnvironment)) {
      // Ambiente atual não é mais válido, limpar
      clearEnvironment();
    }
  }, [availableEnvironments, currentEnvironment, isLoading]);

  // Entrada automática: sem ambiente selecionado, resolver pelo plano.
  // (isLoading só fica false com usuário autenticado — as queries de plano
  // e papel ficam desabilitadas sem sessão.)
  useEffect(() => {
    if (isLoading || currentEnvironment) return;
    setEnvironment(resolveDefaultEnvironment(availableEnvironments, plan, isAdmin));
  }, [isLoading, currentEnvironment, availableEnvironments, plan, isAdmin]);

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
