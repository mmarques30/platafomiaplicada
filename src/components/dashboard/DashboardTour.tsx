import { useState, useCallback } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const steps: Step[] = [
  {
    target: '[data-tour="trilha-recomendada"]',
    content: "Aqui você encontra os conteúdos e trilhas recomendados para sua jornada. Comece por aqui!",
    title: "📚 Trilha Recomendada",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="calendario"]',
    content: "Confira as sessões ao vivo, aulas e eventos programados no calendário.",
    title: "📅 Calendário",
    placement: "right",
  },
  {
    target: '[data-tour="mariana-button"]',
    content: "Sou a MarIAna! Clique aqui sempre que precisar de ajuda, dicas ou recomendações.",
    title: "🤖 MarIAna — Sua Assistente",
    placement: "left",
  },
  {
    target: '[data-tour="evolucao"]',
    content: "Acompanhe seu progresso, conquistas e certificados na seção de evolução.",
    title: "📈 Sua Evolução",
    placement: "right",
  },
  {
    target: '[data-tour="configuracoes"]',
    content: "Personalize seu perfil, altere senha e ajuste preferências aqui.",
    title: "⚙️ Configurações",
    placement: "right",
  },
];

interface DashboardTourProps {
  run: boolean;
}

export function DashboardTour({ run }: DashboardTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleCallback = useCallback(
    async (data: CallBackProps) => {
      const { status, index, type } = data;

      if (type === "step:after") {
        setStepIndex(index + 1);
      }

      const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
      if (finishedStatuses.includes(status)) {
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
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular tour",
      }}
      styles={{
        options: {
          arrowColor: "#1a1c19",
          backgroundColor: "#1a1c19",
          overlayColor: "rgba(0, 0, 0, 0.7)",
          primaryColor: "#9EB038",
          textColor: "#fff",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 700,
        },
        tooltipContent: {
          fontSize: 14,
          lineHeight: 1.6,
        },
        buttonNext: {
          backgroundColor: "#9EB038",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
        },
        buttonSkip: {
          color: "rgba(255,255,255,0.4)",
          fontSize: 13,
        },
      }}
    />
  );
}
