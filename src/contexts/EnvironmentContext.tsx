import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useUserPlan, type UserPlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

/**
 * Ambientes da plataforma.
 *
 * - academy          → alunos do Academy (inclui ex-Builder e ex-Skills)
 * - business_sistemas → Insider pago (projeto em andamento; tem Academy também)
 * - insider_free     → Insider não pago ("outra visão", ainda a definir)
 *
 * Não existe mais ambiente Gratuito nem Builder. A chave `business_sistemas`
 * foi mantida para o Insider pago porque é o valor gravado em
 * profiles.plano_mentoria e em menu_config.planos_permitidos.
 */
export type Environment = "academy" | "business_sistemas" | "insider_free";

interface EnvironmentContextType {
  currentEnvironment: Environment | null;
  setEnvironment: (env: Environment) => void;
  availableEnvironments: Environment[];
  isEnvironmentSelected: boolean;
  /** false = usuário autenticado mas sem nenhum ambiente (ex.: cadastro gratuito antigo) */
  hasAccess: boolean;
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
  academy: {
    label: "Academy",
    icon: "GraduationCap",
    color: "hsl(73, 55%, 46%)", // #c8e040
    description: "Trilhas completas + diagnóstico + evolução",
  },
  business_sistemas: {
    label: "Insider",
    icon: "Wrench",
    color: "hsl(45, 93%, 47%)",
    description: "Acompanhamento do projeto que a IAplicada constrói",
  },
  insider_free: {
    label: "Insider",
    icon: "Sparkles",
    color: "hsl(45, 93%, 47%)",
    description: "Visão Insider sem projeto contratado",
  },
};

const ALL_ENVIRONMENTS: Environment[] = ["academy", "business_sistemas", "insider_free"];

/**
 * Ambientes a que um plano dá acesso.
 *
 * Valores legados continuam entrando (a migração no banco converte
 * business_parceria/business/skills → academy e business_iaplicada →
 * business_sistemas, mas o app trata os dois casos para não deixar
 * ninguém pago de fora caso a migração ainda não tenha rodado).
 */
export function environmentsForPlan(plan: UserPlan | string | null): Environment[] {
  switch (plan) {
    case "business_sistemas":
    case "business_iaplicada":
      return ["academy", "business_sistemas"];
    case "insider_free":
      return ["insider_free"];
    case "academy":
    case "skills":
    case "business_parceria":
    case "business":
      return ["academy"];
    default:
      return [];
  }
}

/**
 * Resolve o ambiente em que o usuário entra automaticamente após o login.
 * Não existe mais tela de seleção. Retorna null quando não há acesso.
 */
export function resolveDefaultEnvironment(
  availableEnvironments: Environment[],
  plan: UserPlan | string | null,
): Environment | null {
  const preferred = environmentsForPlan(plan);
  // Insider pago entra no Insider (não no Academy).
  const planEnvironment =
    plan === "business_sistemas" || plan === "business_iaplicada"
      ? "business_sistemas"
      : preferred[0] ?? null;

  if (planEnvironment && availableEnvironments.includes(planEnvironment)) {
    return planEnvironment;
  }
  // Equipe/admin sem plano: Academy é a visão mais completa.
  if (availableEnvironments.includes("academy")) return "academy";
  return availableEnvironments[0] ?? null;
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored && (ALL_ENVIRONMENTS as string[]).includes(stored) ? (stored as Environment) : null;
  });

  const { user } = useAuth();
  const { plan, isVisitante, isLoading: planLoading } = useUserPlan();
  const { isAdmin, isEquipe, isParceiro, isLoading: roleLoading } = useUserRole();

  const isLoading = planLoading || roleLoading;

  // Determinar ambientes disponíveis baseado no plano
  const availableEnvironments = useMemo<Environment[]>(() => {
    // Admin vê todos para simulação
    if (isAdmin) return [...ALL_ENVIRONMENTS];

    // Equipe e parceiros operam os projetos: Academy + Insider
    if (isEquipe || isParceiro) return ["academy", "business_sistemas"];

    // Cadastro gratuito (visitante) não tem mais acesso à plataforma
    if (isVisitante) return [];

    return environmentsForPlan(plan);
  }, [plan, isVisitante, isAdmin, isEquipe, isParceiro]);

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
      clearEnvironment();
    }
  }, [availableEnvironments, currentEnvironment, isLoading]);

  // Entrada automática: sem ambiente selecionado, resolver pelo plano.
  // (isLoading só fica false com usuário autenticado — as queries de plano
  // e papel ficam desabilitadas sem sessão.)
  useEffect(() => {
    if (isLoading || currentEnvironment) return;
    const next = resolveDefaultEnvironment(availableEnvironments, plan);
    if (next) setEnvironment(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, currentEnvironment, availableEnvironments, plan]);

  const environmentConfig = currentEnvironment ? ENVIRONMENT_CONFIG[currentEnvironment] : null;

  return (
    <EnvironmentContext.Provider
      value={{
        currentEnvironment,
        setEnvironment,
        availableEnvironments,
        isEnvironmentSelected: currentEnvironment !== null,
        hasAccess: availableEnvironments.length > 0,
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
