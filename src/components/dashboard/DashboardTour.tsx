import { useCallback } from "react";
import { Joyride, STATUS, EVENTS } from "react-joyride";
import type { Step, EventData, Controls } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const steps: Step[] = [
  {
    target: '[data-tour="trilha-recomendada"]',
    content: "Aqui você encontra os conteúdos e trilhas recomendados para sua jornada. Comece por aqui!",
    title: "Trilha Recomendada",
    skipBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="calendario"]',
    content: "Confira as sessões ao vivo, aulas e eventos programados no calendário.",
    title: "Calendário",
    placement: "right",
  },
  {
    target: '[data-tour="mariana-button"]',
    content: "Sou a MarIAna! Clique aqui sempre que precisar de ajuda, dicas ou recomendações.",
    title: "MarIAna — Sua Assistente",
    placement: "left",
  },
  {
    target: '[data-tour="evolucao"]',
    content: "Acompanhe seu progresso, conquistas e certificados na seção de evolução.",
    title: "Sua Evolução",
    placement: "right",
  },
  {
    target: '[data-tour="configuracoes"]',
    content: "Personalize seu perfil, altere senha e ajuste preferências aqui.",
    title: "Configurações",
    placement: "right",
  },
];

interface DashboardTourProps {
  run: boolean;
  previewMode?: boolean;
  onComplete?: () => void;
}

export function DashboardTour({ run }: DashboardTourProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleEvent = useCallback(
    async (data: EventData, _controls: Controls) => {
      const { status, type } = data;

      if (
        type === EVENTS.TOUR_END &&
        (status === STATUS.FINISHED || status === STATUS.SKIPPED)
      ) {
        if (user?.id) {
          await supabase
            .from("profiles")
            .update({ primeiro_acesso: false })
            .eq("id", user.id);
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        }
      }
    },
    [user?.id, queryClient]
  );

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      options={{
        backgroundColor: "#1a1c19",
        primaryColor: "#9EB038",
        textColor: "#ffffff",
        overlayColor: "rgba(0, 0, 0, 0.7)",
        showProgress: true,
        arrowColor: "#1a1c19",
        zIndex: 10000,
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular tour",
      }}
      onEvent={handleEvent}
    />
  );
}
