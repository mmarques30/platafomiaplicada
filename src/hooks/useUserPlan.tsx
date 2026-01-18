import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserRole } from "./useUserRole";

export type UserPlan = "academy" | "skills" | "business" | null;

export function useUserPlan() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const { data: plan, isLoading: planLoading } = useQuery({
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
        // Todos os planos têm acesso a trilhas
        return ["academy", "skills", "business"].includes(plan);
      case "skills":
        // Skills e Business têm acesso
        return ["skills", "business"].includes(plan);
      case "business":
        // Apenas Business tem acesso
        return plan === "business";
      default:
        return false;
    }
  };

  // Admin sempre vê a interface Business para fins de visualização
  const effectiveIsBusiness = isAdmin || plan === "business";
  const effectiveIsSkills = !effectiveIsBusiness && plan === "skills";
  const effectiveIsAcademy = !effectiveIsBusiness && !effectiveIsSkills;

  return {
    plan,
    effectivePlan: isAdmin ? "business" : plan,
    hasAccessTo,
    isLoading: planLoading,
    // Flags efetivas (consideram admin)
    isBusiness: effectiveIsBusiness,
    isSkills: effectiveIsSkills,
    isAcademy: effectiveIsAcademy,
    // Flags do plano real (sem considerar admin)
    rawIsBusiness: plan === "business",
    rawIsSkills: plan === "skills",
    rawIsAcademy: plan === "academy",
  };
}
