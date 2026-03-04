import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext, AdminViewMode } from "@/contexts/AdminViewContext";

export type UserPlan = "academy" | "skills" | "business" | "business_iaplicada" | null;

export function useUserPlan() {
  const { user, loading: authLoading } = useAuth();

  // Usar isPending em vez de isLoading - isPending é true quando query está disabled
  const { data, isPending } = useQuery({
    queryKey: ["user-plan", user?.id],
    queryFn: async () => {
      if (!user) return { plan: null, isVisitante: false, skillsLiberado: false };
      const { data, error } = await supabase
        .from("profiles")
        .select("plano_mentoria, is_visitante, skills_liberado")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return {
        plan: data?.plano_mentoria as UserPlan,
        isVisitante: data?.is_visitante ?? false,
        skillsLiberado: data?.skills_liberado ?? false
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const plan = data?.plan ?? null;
  const isProfileVisitante = data?.isVisitante ?? false;
  const skillsLiberado = data?.skillsLiberado ?? false;

  // Loading inclui auth + query pending
  const isLoading = authLoading || isPending;


  // Hierarquia de acesso PARALELA:
  // Academy = base para todos
  // Skills = skills + academy
  // Business (ambos) = business + academy
  
  const hasAccessTo = (product: "trilhas" | "skills" | "business") => {
    if (!plan) return false;
    
    switch (product) {
      case "trilhas": // academy - base para todos
        return ["academy", "skills", "business", "business_iaplicada"].includes(plan);
      case "skills": // apenas skills
        return plan === "skills";
      case "business": // ambos os tipos business
        return plan === "business" || plan === "business_iaplicada";
      default:
        return false;
    }
  };

  // Helpers para tipos específicos de Business
  const isBusinessColaborativo = plan === "business";
  const isBusinessIAplicada = plan === "business_iaplicada";
  const isAnyBusiness = isBusinessColaborativo || isBusinessIAplicada;

  return {
    plan,
    hasAccessTo,
    isLoading,
    isAcademy: plan === "academy",
    isSkills: plan === "skills",
    isBusiness: isAnyBusiness,
    isBusinessColaborativo,
    isBusinessIAplicada,
    isVisitante: isProfileVisitante,
    skillsLiberado,
  };
}

// Hook separado para obter plano efetivo considerando admin e viewAs
export function useEffectivePlan(isAdmin: boolean, isAdminLoading: boolean = false, isParceiro: boolean = false) {
  const { plan, hasAccessTo, isLoading: planLoading, isAcademy, isSkills, isBusiness, isBusinessColaborativo, isBusinessIAplicada, isVisitante: isRealVisitante } = useUserPlan();
  
  // isLoading combinado inclui o carregamento do role para evitar race conditions
  const isLoading = planLoading || isAdminLoading;
  
  // Obter o viewAs do context (safe access)
  const context = useAdminViewContext();
  const viewAs = context.viewAs;
  const isViewingAs = context.isViewingAs;

  // CRÍTICO: Se temos uma simulação ativa (viewAs no context), aplicar MESMO durante loading
  // Isso evita que o redirect para /trilhas aconteça antes do isAdmin carregar
  const hasActiveSimulation = isViewingAs && viewAs !== null;

  // Função centralizada para verificar acesso efetivo (hierarquia paralela)
  const hasEffectiveAccessTo = (product: "trilhas" | "skills" | "business") => {
    // Determinar o plano atual considerando simulação
    let currentPlan: UserPlan | null = null;
    
    // Se há simulação ativa, usar o plano simulado
    if (hasActiveSimulation) {
      currentPlan = viewAs === "visitante" ? null : viewAs as UserPlan;
    } else if (isAdmin || isParceiro) {
      currentPlan = "business"; // Admin e parceiros sem viewAs veem como business
    } else {
      currentPlan = plan;
    }
    
    if (!currentPlan) return false;
    
    // Hierarquia paralela:
    // Academy = base para todos
    // Skills = skills + academy
    // Business (ambos) = business + academy
    switch (product) {
      case "trilhas": // academy - base para todos
        return ["academy", "skills", "business", "business_iaplicada"].includes(currentPlan);
      case "skills": // apenas skills
        return currentPlan === "skills";
      case "business": // ambos os tipos business
        return currentPlan === "business" || currentPlan === "business_iaplicada";
      default:
        return false;
    }
  };

  // Se há simulação ativa (viewAs no localStorage/context), aplicar independente de isAdmin
  // Isso é seguro porque o AdminViewSelector só aparece para admins
  if (hasActiveSimulation) {
    const isSimulatingVisitante = viewAs === "visitante";
    const simulatedPlan = isSimulatingVisitante ? null : viewAs as UserPlan;
    const isSimulatingAnyBusiness = viewAs === "business" || viewAs === "business_iaplicada";
    
    return {
      plan,
      effectivePlan: simulatedPlan,
      hasAccessTo,
      hasEffectiveAccessTo,
      isLoading,
      // Flags efetivas (baseadas na simulação)
      isBusiness: isSimulatingAnyBusiness,
      isBusinessColaborativo: viewAs === "business",
      isBusinessIAplicada: viewAs === "business_iaplicada",
      isSkills: viewAs === "skills",
      isAcademy: viewAs === "academy",
      isVisitante: viewAs === "visitante",
      // Flags do plano real
      rawIsBusiness: isBusiness,
      rawIsBusinessColaborativo: isBusinessColaborativo,
      rawIsBusinessIAplicada: isBusinessIAplicada,
      rawIsSkills: isSkills,
      rawIsAcademy: isAcademy,
      // Info de simulação
      isSimulating: true,
      simulatingAs: viewAs,
    };
  }

  // Visitante real: flag do profile OU não tem plano (sem ser admin)
  // IMPORTANTE: Durante loading, não marcar como visitante para evitar redirect prematuro
  const effectiveIsVisitante = isLoading ? false : (isRealVisitante || (!isAdmin && !plan));

  // Sem simulação: admin e parceiros veem como business (padrão)
  const effectiveIsBusiness = isAdmin || isParceiro || isBusiness;
  const effectiveIsSkills = !effectiveIsBusiness && isSkills;
  // Corrigir: visitantes NÃO são Academy - só é Academy se tiver plano academy real
  const effectiveIsAcademy = !effectiveIsBusiness && !effectiveIsSkills && !effectiveIsVisitante && isAcademy;

  // Para flags específicas de Business: admin e parceiros veem como colaborativo por padrão
  const effectiveIsBusinessColaborativo = isAdmin || isParceiro || isBusinessColaborativo;
  const effectiveIsBusinessIAplicada = !isAdmin && !isParceiro && isBusinessIAplicada;

  return {
    plan,
    effectivePlan: (isAdmin || isParceiro) ? "business" as UserPlan : plan,
    hasAccessTo,
    hasEffectiveAccessTo,
    isLoading,
    // Flags efetivas (consideram admin)
    isBusiness: effectiveIsBusiness,
    isBusinessColaborativo: effectiveIsBusinessColaborativo,
    isBusinessIAplicada: effectiveIsBusinessIAplicada,
    isSkills: effectiveIsSkills,
    isAcademy: effectiveIsAcademy,
    isVisitante: effectiveIsVisitante,
    // Flags do plano real (sem considerar admin)
    rawIsBusiness: isBusiness,
    rawIsBusinessColaborativo: isBusinessColaborativo,
    rawIsBusinessIAplicada: isBusinessIAplicada,
    rawIsSkills: isSkills,
    rawIsAcademy: isAcademy,
    // Info de simulação
    isSimulating: false,
    simulatingAs: null,
  };
}
