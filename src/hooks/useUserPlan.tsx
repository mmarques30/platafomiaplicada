import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext, AdminViewMode } from "@/contexts/AdminViewContext";

export type UserPlan = "academy" | "skills" | "business_parceria" | "business_sistemas" | null;

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
        return ["academy", "skills", "business_parceria", "business_sistemas"].includes(plan);
      case "skills": // apenas skills
        return plan === "skills";
      case "business": // ambos os tipos business
        return plan === "business_parceria" || plan === "business_sistemas";
      default:
        return false;
    }
  };

  // Helpers para tipos específicos de Business
  const isBusinessParceria = plan === "business_parceria";
  const isBusinessSistemas = plan === "business_sistemas";
  const isAnyBusiness = isBusinessParceria || isBusinessSistemas;

  return {
    plan,
    hasAccessTo,
    isLoading,
    isAcademy: plan === "academy",
    isSkills: plan === "skills",
    isBusiness: isAnyBusiness,
    isBusinessParceria,
    isBusinessSistemas,
    isVisitante: isProfileVisitante,
    skillsLiberado,
  };
}

// Hook separado para obter plano efetivo considerando admin e viewAs
export function useEffectivePlan(isAdmin: boolean, isAdminLoading: boolean = false, isParceiro: boolean = false) {
  const { plan, hasAccessTo, isLoading: planLoading, isAcademy, isSkills, isBusiness, isBusinessParceria, isBusinessSistemas, isVisitante: isRealVisitante } = useUserPlan();
  
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
      currentPlan = "business_parceria"; // Admin e parceiros sem viewAs veem como business
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
        return ["academy", "skills", "business_parceria", "business_sistemas"].includes(currentPlan);
      case "skills": // apenas skills
        return currentPlan === "skills";
      case "business": // ambos os tipos business
        return currentPlan === "business_parceria" || currentPlan === "business_sistemas";
      default:
        return false;
    }
  };

  // Se há simulação ativa (viewAs no localStorage/context), aplicar independente de isAdmin
  // Isso é seguro porque o AdminViewSelector só aparece para admins
  if (hasActiveSimulation) {
    const isSimulatingVisitante = viewAs === "visitante";
    const simulatedPlan = isSimulatingVisitante ? null : viewAs as UserPlan;
    const isSimulatingAnyBusiness = viewAs === "business_parceria" || viewAs === "business_sistemas";
    
    return {
      plan,
      effectivePlan: simulatedPlan,
      hasAccessTo,
      hasEffectiveAccessTo,
      isLoading,
      // Flags efetivas (baseadas na simulação)
      isBusiness: isSimulatingAnyBusiness,
      isBusinessParceria: viewAs === "business_parceria",
      isBusinessSistemas: viewAs === "business_sistemas",
      isSkills: viewAs === "skills",
      isAcademy: viewAs === "academy",
      isVisitante: viewAs === "visitante",
      // Flags do plano real
      rawIsBusiness: isBusiness,
      rawIsBusinessParceria: isBusinessParceria,
      rawIsBusinessSistemas: isBusinessSistemas,
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

  // Para flags específicas de Business: admin e parceiros veem como parceria por padrão
  const effectiveIsBusinessParceria = isAdmin || isParceiro || isBusinessParceria;
  const effectiveIsBusinessSistemas = !isAdmin && !isParceiro && isBusinessSistemas;

  return {
    plan,
    effectivePlan: (isAdmin || isParceiro) ? "business_parceria" as UserPlan : plan,
    hasAccessTo,
    hasEffectiveAccessTo,
    isLoading,
    // Flags efetivas (consideram admin)
    isBusiness: effectiveIsBusiness,
    isBusinessParceria: effectiveIsBusinessParceria,
    isBusinessSistemas: effectiveIsBusinessSistemas,
    isSkills: effectiveIsSkills,
    isAcademy: effectiveIsAcademy,
    isVisitante: effectiveIsVisitante,
    // Flags do plano real (sem considerar admin)
    rawIsBusiness: isBusiness,
    rawIsBusinessParceria: isBusinessParceria,
    rawIsBusinessSistemas: isBusinessSistemas,
    rawIsSkills: isSkills,
    rawIsAcademy: isAcademy,
    // Info de simulação
    isSimulating: false,
    simulatingAs: null,
  };
}
