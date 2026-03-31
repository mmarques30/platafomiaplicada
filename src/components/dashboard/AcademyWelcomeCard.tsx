import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, BookOpen, ClipboardCheck, Compass } from "lucide-react";

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

  if (!isAcademy || !isFirstAccess || dismissed) return null;

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
    <Card className="relative border-primary/30 bg-primary/5 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="pt-6 pb-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Olá, {firstName}! Por onde começar?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha uma das opções abaixo para dar seus primeiros passos na plataforma.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="flex items-center gap-2 h-auto py-3 px-4 justify-start border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-left">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
