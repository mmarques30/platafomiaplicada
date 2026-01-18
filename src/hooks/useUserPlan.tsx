import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserPlan = "academy" | "skills" | "business" | null;

export function useUserPlan() {
  const { user } = useAuth();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["user-plan", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("plano_mentoria")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data?.plano_mentoria as UserPlan;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Hierarquia de acesso:
  // Academy = base (acesso a trilhas)
  // Skills = trilhas + gestão de equipe (B2B)
  // Business = acesso completo + mentoria 1:1 + consultoria (B2B Premium)
  
  const hasAccessTo = (product: "trilhas" | "skills" | "business") => {
    if (!plan) return false;
    
    switch (product) {
      case "trilhas":
        return ["academy", "skills", "business"].includes(plan);
      case "skills":
        return ["skills", "business"].includes(plan);
      case "business":
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
  };
}

// Hook separado para obter plano efetivo considerando admin
export function useEffectivePlan(isAdmin: boolean) {
  const { plan, hasAccessTo, isLoading, isAcademy, isSkills, isBusiness } = useUserPlan();

  // Admin sempre vê a interface Business para fins de visualização
  const effectiveIsBusiness = isAdmin || isBusiness;
  const effectiveIsSkills = !effectiveIsBusiness && isSkills;
  const effectiveIsAcademy = !effectiveIsBusiness && !effectiveIsSkills;

  return {
    plan,
    effectivePlan: isAdmin ? "business" as UserPlan : plan,
    hasAccessTo,
    isLoading,
    // Flags efetivas (consideram admin)
    isBusiness: effectiveIsBusiness,
    isSkills: effectiveIsSkills,
    isAcademy: effectiveIsAcademy,
    // Flags do plano real (sem considerar admin)
    rawIsBusiness: isBusiness,
    rawIsSkills: isSkills,
    rawIsAcademy: isAcademy,
  };
}
