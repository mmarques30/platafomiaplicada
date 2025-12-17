import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ClipboardCheck, Check, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const PESQUISA_APLICA_ID = "9a357821-4e62-4176-9f6c-46b0668cb450";

interface PendenciaItem {
  key: string;
  label: string;
  completed: boolean;
  link: string;
}

export function PendenciasOnboarding() {
  const { user } = useAuth();

  // Verificar se diagnóstico está completo
  const { data: diagnostico, isLoading: loadingDiagnostico } = useQuery({
    queryKey: ["pendencia-diagnostico", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("formulario_diagnostico")
        .select("completado")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Verificar se pesquisa está completa
  const { data: pesquisa, isLoading: loadingPesquisa } = useQuery({
    queryKey: ["pendencia-pesquisa", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("respostas_pesquisas")
        .select("completado")
        .eq("pesquisa_id", PESQUISA_APLICA_ID)
        .eq("user_id", user!.id)
        .eq("completado", true)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isLoading = loadingDiagnostico || loadingPesquisa;

  // Montar lista de pendências
  const pendencias: PendenciaItem[] = [
    {
      key: "diagnostico",
      label: "Diagnóstico Estratégico",
      completed: diagnostico?.completado === true,
      link: "/meu-diagnostico",
    },
    {
      key: "pesquisa",
      label: "Pesquisa de Perfil",
      completed: !!pesquisa,
      link: "/formulario-aplica",
    },
  ];

  const completedCount = pendencias.filter((p) => p.completed).length;
  const totalCount = pendencias.length;
  const allCompleted = completedCount === totalCount;

  // Não mostrar se carregando ou se tudo completo
  if (isLoading || allCompleted) {
    return null;
  }

  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Ícone */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="font-semibold text-foreground">
                Complete seu perfil
              </h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {completedCount}/{totalCount}
              </span>
            </div>

            {/* Barra de progresso */}
            <Progress value={progressPercent} className="h-1.5 mb-4" />

            {/* Lista de pendências */}
            <p className="text-sm text-muted-foreground mb-3">
              Para personalizar sua experiência, complete:
            </p>
            <div className="space-y-2">
              {pendencias.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.completed ? (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm truncate ${
                        item.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.completed ? (
                    <span className="text-xs text-primary font-medium whitespace-nowrap">
                      Concluído
                    </span>
                  ) : (
                    <Link
                      to={item.link}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                    >
                      Preencher
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
