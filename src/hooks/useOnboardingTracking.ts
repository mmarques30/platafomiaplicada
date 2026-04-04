import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";

type OnboardingEvento =
  | "video_visto"
  | "tour_concluido"
  | "proximos_passos_vistos"
  | "diagnostico_iniciado"
  | "trilha_iniciada"
  | "roadmap_visitado"
  | "sistema_visitado"
  | "skills_diagnostico_iniciado";

export function useOnboardingTracking() {
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { effectivePlan } = useEffectivePlan(isAdmin, roleLoading);

  const track = useCallback(
    async (evento: OnboardingEvento) => {
      if (!user?.id) return;
      try {
        await supabase.from("onboarding_eventos").insert({
          user_id: user.id,
          plano: effectivePlan ?? "visitante",
          evento,
        });
      } catch (_) {
        // falha silenciosa — tracking não deve quebrar a UX
      }
    },
    [user?.id, effectivePlan]
  );

  return { track };
}
