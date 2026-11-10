import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { X, BookOpen, ClipboardCheck, Compass, ArrowRight } from "lucide-react";

interface AcademyWelcomeCardProps {
  onStartTour?: () => void;
}

export function AcademyWelcomeCard({ onStartTour }: AcademyWelcomeCardProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  const isAcademy = profile?.plano_mentoria === "academy";
  const isFirstAccess = profile?.primeiro_acesso === true;

  const dataOnboarding = profile?.created_at ? new Date(profile.created_at) : null;
  const diasDesdeOnboarding = dataOnboarding
    ? Math.floor((Date.now() - dataOnboarding.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const shouldShow = isAcademy && isFirstAccess && !dismissed && diasDesdeOnboarding <= 7;

  const { data: primeiraTrilha } = useQuery({
    queryKey: ["primeira-trilha-recomendada"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trilhas")
        .select("id, titulo")
        .eq("visivel_mentorados", true)
        .order("ordem")
        .limit(1)
        .single();
      if (error) return null;
      return data;
    },
    enabled: shouldShow,
    staleTime: 1000 * 60 * 30,
  });

  if (!shouldShow) return null;

  const firstName = profile?.nome_completo?.split(" ")[0] || "aluno";

  const handleDismiss = async () => {
    setDismissed(true);
    if (user?.id) {
      await supabase
        .from("profiles")
        .update({ primeiro_acesso: false })
        .eq("id", user.id);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    }
  };

  const actions = [
    {
      label: "Ver minha primeira trilha",
      icon: BookOpen,
      onClick: () => navigate("/trilhas"),
    },
    {
      label: "Preencher meu diagnóstico",
      icon: ClipboardCheck,
      onClick: () => navigate("/diagnostico/formulario"),
    },
    {
      label: "Conhecer a plataforma",
      icon: Compass,
      onClick: () => {
        onStartTour?.();
        handleDismiss();
      },
    },
  ];

  return (
    /*
     * O cartão de primeiros passos.
     *
     * Estava com cor escrita à mão: `#c8e040` no rótulo, `#0c0e08` no texto
     * do botão, `rgba(175,192,64,0.08)` no fundo da caixa, tudo em `style`
     * inline. Em tema claro o botão ficava lime sobre lime, e nenhum desses
     * valores acompanhava uma troca de paleta. Agora são os mesmos tokens do
     * resto da plataforma, e os três atalhos viram lista vertical, que é o
     * que cabe na coluna lateral.
     */
    <section className="superficie relative overflow-hidden p-4 md:p-5">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
      />

      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="space-y-4">
        <div className="pr-8">
          <span className="rotulo-mono">Primeiros passos</span>
          <h3 className="mt-1.5 text-base font-medium leading-snug text-foreground">
            Olá, {firstName}! Por onde começar?
          </h3>
        </div>

        <ul className="space-y-1.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.label}>
                <button
                  type="button"
                  onClick={action.onClick}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {action.label}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                    strokeWidth={1.75}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-3.5">
          <span className="rotulo-mono text-primary">Comece por aqui</span>
          <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
            {primeiraTrilha?.titulo ?? "Introdução à IA Aplicada"}
          </p>
          <Button
            size="pill"
            className="mt-3 w-full"
            onClick={() => navigate(primeiraTrilha ? `/trilhas/${primeiraTrilha.id}` : "/trilhas")}
          >
            Começar trilha
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </section>
  );
}
