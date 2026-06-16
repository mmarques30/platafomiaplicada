import { useCallback, useEffect, useMemo } from "react";
import { Joyride, STATUS, EVENTS } from "react-joyride";
import type { Step, EventData, Controls } from "react-joyride";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useOnboardingTracking } from "@/hooks/useOnboardingTracking";

const allSteps: Step[] = [
  {
    target: '[data-tour="aprender"]',
    content: "Aqui você acessa trilhas, aulas e todo o conteúdo para desenvolver suas habilidades em IA.",
    title: "Aprender",
    skipBeacon: true,
    placement: "right" as const,
  },
  {
    target: '[data-tour="meu-progresso"]',
    content: "Aqui você acompanha o progresso do seu plano, metas e evolução na mentoria.",
    title: "Meu Progresso",
    placement: "right" as const,
  },
  {
    target: '[data-tour="meu-projeto"]',
    content: "Gerencie seu projeto, acompanhe entregas e veja o roadmap de implementação.",
    title: "Meu Projeto",
    placement: "right" as const,
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
  const { track } = useOnboardingTracking();

  const visibleSteps = useMemo(() => {
    if (!run) return [];
    return allSteps.filter(step =>
      document.querySelector(step.target as string)
    );
  }, [run]);

  // Se o componente desmontar durante o tour (usuário navegou), marcar como concluído
  useEffect(() => {
    if (!run || previewMode) return;
    return () => {
      if (user?.id) {
        supabase
          .from("profiles")
          .update({ primeiro_acesso: false })
          .eq("id", user.id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          });
      }
    };
  }, [run, previewMode, user?.id, queryClient]);

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
          await track('tour_concluido');
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
      steps={visibleSteps}
      run={run}
      continuous
      options={{
        // Tokens da marca em HSL → hex equivalentes (Joyride não aceita CSS vars)
        backgroundColor: "#F7F6E8",      // brand-cream-soft
        primaryColor: "#5C6F1D",         // brand-strong
        textColor: "#0A0A0A",            // foreground
        overlayColor: "rgba(10, 10, 10, 0.45)",
        showProgress: true,
        arrowColor: "#F7F6E8",           // brand-cream-soft (continua o tooltip)
        zIndex: 10000,
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular tour",
      }}
      styles={({
        tooltip: {
          borderRadius: 14,
          border: "1px solid #EAEAE0",   // brand-hairline
          boxShadow: "0 24px 60px rgba(10, 10, 10, 0.15)",
          padding: 20,
        },
        tooltipTitle: {
          color: "#0A0A0A",
          fontSize: 17,
          fontWeight: 600,
          fontFamily: "var(--font-serif-display, 'Fraunces', serif)",
          letterSpacing: "-0.01em",
          marginBottom: 6,
        },
        tooltipContent: {
          color: "#5A5A52",              // muted-foreground aproximado
          fontSize: 14,
          lineHeight: 1.55,
          padding: "8px 0 4px",
        },
        buttonNext: {
          backgroundColor: "#5C6F1D",    // brand-strong
          color: "#F0EFD9",              // brand-cream
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 500,
          outline: "none",
        },
        buttonBack: {
          color: "#5A5A52",
          fontSize: 13,
          marginRight: 8,
        },
        buttonSkip: {
          color: "#8A8A82",
          fontSize: 12,
        },
        buttonClose: {
          color: "#8A8A82",
          width: 12,
          height: 12,
          top: 14,
          right: 14,
        },
      }) as any}
      onEvent={handleEvent}
    />
  );
}
