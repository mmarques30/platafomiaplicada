import { useCallback } from "react";
import { Joyride, STATUS, EVENTS } from "react-joyride";
import type { Step, EventData, Controls } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

const steps: Step[] = [
  {
    target: '[data-tour="aprender"]',
    content: "Aqui você acessa trilhas, aulas e todo o conteúdo para desenvolver suas habilidades em IA.",
    title: "Aprender",
    skipBeacon: true,
    placement: "right",
  },
  {
    target: '[data-tour="bibliotecas"]',
    content: "Explore prompts prontos, ferramentas de IA e materiais de apoio organizados por tema.",
    title: "Bibliotecas",
    placement: "right",
  },
  {
    target: '[data-tour="calendario"]',
    content: "Confira as sessões ao vivo, aulas e eventos programados no calendário.",
    title: "Calendário",
    placement: "right",
  },
  {
    target: '[data-tour="evolucao"]',
    content: "Acompanhe seu progresso, conquistas e certificados na seção de evolução.",
    title: "Sua Evolução",
    placement: "right",
  },
  {
    target: '[data-tour="mariana-button"]',
    content: "Sou a MarIAna! Clique aqui sempre que precisar de ajuda, dicas ou recomendações.",
    title: "MarIAna — Sua Assistente",
    placement: "left",
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

export function DashboardTour({ run, previewMode, onComplete }: DashboardTourProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleEvent = useCallback(
    async (data: EventData, _controls: Controls) => {
      const { status, type } = data;

      if (
        type === EVENTS.TOUR_END &&
        (status === STATUS.FINISHED || status === STATUS.SKIPPED)
      ) {
        if (previewMode) {
          onComplete?.();
          return;
        }
        if (user?.id) {
          await supabase
            .from("profiles")
            .update({ primeiro_acesso: false })
            .eq("id", user.id);
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        }
      }
    },
    [user?.id, queryClient, previewMode, onComplete]
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
      styles={{
        tooltipTitle: {
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 600,
        },
        tooltipContent: {
          color: '#ffffff',
        },
      }}
      onEvent={handleEvent}
    />
  );
}
