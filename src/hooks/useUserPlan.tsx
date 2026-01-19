import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext, AdminViewMode } from "@/contexts/AdminViewContext";

export type UserPlan = "academy" | "skills" | "business" | null;

export function useUserPlan() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["user-plan", user?.id],
    queryFn: async () => {
      if (!user) return { plan: null, isVisitante: false };
      const { data, error } = await supabase
        .from("profiles")
        .select("plano_mentoria, is_visitante")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return {
        plan: data?.plano_mentoria as UserPlan,
        isVisitante: data?.is_visitante ?? false
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const plan = data?.plan ?? null;
  const isProfileVisitante = data?.isVisitante ?? false;

  // Hierarquia de acesso PARALELA:
  // Academy = base para todos
  // Skills = skills + academy
  // Business = business + academy
  
  const hasAccessTo = (product: "trilhas" | "skills" | "business") => {
    if (!plan) return false;
    
    switch (product) {
      case "trilhas": // academy - base para todos
        return ["academy", "skills", "business"].includes(plan);
      case "skills": // apenas skills
        return plan === "skills";
      case "business": // apenas business
        return plan === "business";
      default:
        return false;
    }
  };

  return {
    plan,
    hasAccessTo,
    isLoading,
    isAcademy: plan === "academy",
    isSkills: plan === "skills",
    isBusiness: plan === "business",
    isVisitante: isProfileVisitante,
  };
}

// Hook separado para obter plano efetivo considerando admin e viewAs
export function useEffectivePlan(isAdmin: boolean) {
  const { plan, hasAccessTo, isLoading, isAcademy, isSkills, isBusiness, isVisitante: isRealVisitante } = useUserPlan();
  
  // Obter o viewAs do context (safe access)
  let viewAs: AdminViewMode = null;
  let isViewingAs = false;
  
  try {
    const context = useAdminViewContext();
    viewAs = context.viewAs;
    isViewingAs = context.isViewingAs;
  } catch {
    // Context not available, use defaults
  }

  // Função centralizada para verificar acesso efetivo (hierarquia paralela)
  const hasEffectiveAccessTo = (product: "trilhas" | "skills" | "business") => {
    // Determinar o plano atual considerando simulação
    let currentPlan: UserPlan | null = null;
    
    if (isAdmin && isViewingAs && viewAs) {
      currentPlan = viewAs === "visitante" ? null : viewAs as UserPlan;
    } else if (isAdmin) {
      currentPlan = "business"; // Admin sem viewAs vê como business
    } else {
      currentPlan = plan;
    }
    
    if (!currentPlan) return false;
    
    // Hierarquia paralela:
    // Academy = base para todos
    // Skills = skills + academy
    // Business = business + academy
    switch (product) {
      case "trilhas": // academy - base para todos
        return ["academy", "skills", "business"].includes(currentPlan);
      case "skills": // apenas skills
        return currentPlan === "skills";
      case "business": // apenas business
        return currentPlan === "business";
      default:
        return false;
    }
  };

  // Se admin está usando "ver como", usar essa visão
  if (isAdmin && isViewingAs && viewAs) {
    const isSimulatingVisitante = viewAs === "visitante";
    const simulatedPlan = isSimulatingVisitante ? null : viewAs as UserPlan;
    
    return {
      plan,
      effectivePlan: simulatedPlan,
      hasAccessTo,
      hasEffectiveAccessTo,
      isLoading,
      // Flags efetivas (baseadas na simulação)
      isBusiness: viewAs === "business",
      isSkills: viewAs === "skills",
      isAcademy: viewAs === "academy",
      isVisitante: viewAs === "visitante",
      // Flags do plano real
      rawIsBusiness: isBusiness,
      rawIsSkills: isSkills,
      rawIsAcademy: isAcademy,
      // Info de simulação
      isSimulating: true,
      simulatingAs: viewAs,
    };
  }

  // Admin sem viewAs vê como business (padrão)
  const effectiveIsBusiness = isAdmin || isBusiness;
  const effectiveIsSkills = !effectiveIsBusiness && isSkills;
  const effectiveIsAcademy = !effectiveIsBusiness && !effectiveIsSkills;
  
  // Visitante real: flag do profile OU não tem plano (sem ser admin)
  const effectiveIsVisitante = isRealVisitante || (!isAdmin && !plan);

  return {
    plan,
    effectivePlan: isAdmin ? "business" as UserPlan : plan,
    hasAccessTo,
    hasEffectiveAccessTo,
    isLoading,
    // Flags efetivas (consideram admin)
    isBusiness: effectiveIsBusiness,
    isSkills: effectiveIsSkills,
    isAcademy: effectiveIsAcademy,
    isVisitante: effectiveIsVisitante,
    // Flags do plano real (sem considerar admin)
    rawIsBusiness: isBusiness,
    rawIsSkills: isSkills,
    rawIsAcademy: isAcademy,
    // Info de simulação
    isSimulating: false,
    simulatingAs: null,
  };
}
