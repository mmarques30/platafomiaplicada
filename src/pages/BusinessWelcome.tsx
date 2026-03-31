import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import logoAplicada from "@/assets/logo-aplicada-nova.png";

const steps = [
  {
    number: 1,
    title: "Explore seu roadmap",
    description: "veja as fases do seu projeto",
  },
  {
    number: 2,
    title: "Conheça suas etapas",
    description: "entenda o que será entregue",
  },
  {
    number: 3,
    title: "Aguarde sua primeira sessão",
    description: "ela será agendada em breve",
  },
];

export default function BusinessWelcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const firstName = profile?.nome_completo?.split(" ")[0] || "";

  const handleEnter = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({ primeiro_acesso: false })
        .eq("id", user.id);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      navigate("/mentoria", { replace: true });
    } catch {
      navigate("/mentoria", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <img
          src={logoAplicada}
          alt="IAplicada"
          className="h-10 object-contain"
        />

        <div className="text-center space-y-2">
          <h1
            className="text-foreground"
            style={{ fontSize: 28, fontWeight: 500 }}
          >
            Bem-vindo à sua jornada{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: 15 }}>
            Sua mentoria começa agora. Aqui estão seus primeiros passos:
          </p>
        </div>

        <div className="w-full space-y-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-3 rounded-lg bg-card p-4"
              style={{ borderLeft: "3px solid #2CBBA6" }}
            >
              <span
                className="text-foreground shrink-0"
                style={{ fontSize: 15, fontWeight: 500 }}
              >
                {step.number}.
              </span>
              <p className="text-muted-foreground" style={{ fontSize: 14 }}>
                <span
                  className="text-foreground"
                  style={{ fontWeight: 500 }}
                >
                  {step.title}
                </span>{" "}
                — {step.description}
              </p>
            </div>
          ))}
        </div>

        <Button
          onClick={handleEnter}
          disabled={loading}
          className="w-full"
          style={{
            backgroundColor: "#AFC040",
            color: "#0C0F0A",
            fontWeight: 500,
            borderRadius: 8,
            padding: "12px 32px",
            height: "auto",
          }}
        >
          {loading ? "Entrando..." : "Entrar na plataforma"}
        </Button>
      </div>
    </div>
  );
}
