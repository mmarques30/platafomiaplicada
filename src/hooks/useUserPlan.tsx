import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserPlan = "academy" | "lab" | "skills" | "club" | null;

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
  // Lab = trilhas + mentoria em grupo
  // Club = trilhas + mentoria 1:1 + lab
  // Skills = trilhas (B2B)
  
  const hasAccessTo = (product: "trilhas" | "lab" | "club" | "skills") => {
    if (!plan) return false;
    
    switch (product) {
      case "trilhas":
        // Todos os planos têm acesso a trilhas
        return ["academy", "lab", "skills", "club"].includes(plan);
      case "lab":
        // Lab e Club têm acesso
        return ["lab", "club"].includes(plan);
      case "club":
        // Apenas Club tem acesso
        return plan === "club";
      case "skills":
        // Apenas Skills tem acesso
        return plan === "skills";
      default:
        return false;
    }
  };

  return {
    plan,
    hasAccessTo,
    isLoading,
    isAcademy: plan === "academy",
    isLab: plan === "lab",
    isClub: plan === "club",
    isSkills: plan === "skills",
  };
}
