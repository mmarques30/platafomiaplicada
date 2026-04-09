import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen, Wrench, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MetaAcademy } from "@/hooks/useMetasAcademy";

interface AlertaItem {
  icon: React.ReactNode;
  message: string;
  cta?: { label: string; path: string };
  priority: number;
}

interface AlertasInteligentesProps {
  insightIA: any;
  metas: MetaAcademy[];
}

export function AlertasInteligentes({ insightIA, metas }: AlertasInteligentesProps) {
  const navigate = useNavigate();
  const alertas: AlertaItem[] = [];

  // Alertas de tarefas vencendo
  const hoje = new Date();
  const proximaSemana = new Date();
  proximaSemana.setDate(hoje.getDate() + 7);

  const tarefasVencendo = metas.filter(
    (m) => m.status !== "concluida" && m.prazo && new Date(m.prazo) <= proximaSemana && new Date(m.prazo) >= hoje
  );
  const tarefasAtrasadas = metas.filter(
    (m) => m.status !== "concluida" && m.prazo && new Date(m.prazo) < hoje
  );

  if (tarefasAtrasadas.length > 0) {
    alertas.push({
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      message: `Você tem ${tarefasAtrasadas.length} tarefa(s) atrasada(s)`,
      priority: 1,
    });
  }

  if (tarefasVencendo.length > 0) {
    alertas.push({
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      message: `${tarefasVencendo.length} tarefa(s) vencem esta semana`,
      priority: 2,
    });
  }

  // Alertas baseados no insight_ia
  if (insightIA) {
    const ferramentas = insightIA.ferramentas_recomendadas || insightIA.ferramentas || [];
    if (ferramentas.length > 0) {
      alertas.push({
        icon: <Wrench className="h-4 w-4 text-primary" />,
        message: `Explore as ferramentas recomendadas no Arsenal IA: ${ferramentas.slice(0, 3).join(", ")}`,
        cta: { label: "Ir para Arsenal IA", path: "/metodos-aplicar" },
        priority: 3,
      });
    }

    const trilhas = insightIA.trilhas_recomendadas || [];
    if (trilhas.length > 0) {
      alertas.push({
        icon: <BookOpen className="h-4 w-4 text-green-500" />,
        message: `Você tem ${trilhas.length} trilha(s) recomendada(s) pelo diagnóstico`,
        cta: { label: "Ver Trilhas", path: "/trilhas" },
        priority: 4,
      });
    }

    const etapas = insightIA.etapas || insightIA.roadmap || [];
    if (etapas.length > 0) {
      const pendentes = metas.filter((m) => m.status === "pendente").length;
      if (pendentes === 0 && metas.length === 0) {
        alertas.push({
          icon: <Target className="h-4 w-4 text-blue-500" />,
          message: "Crie suas primeiras tarefas baseadas nos objetivos do diagnóstico",
          priority: 5,
        });
      }
    }
  }

  const sorted = alertas.sort((a, b) => a.priority - b.priority).slice(0, 5);

  if (sorted.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertas Inteligentes
        </h3>
        <div className="space-y-2">
          {sorted.map((alerta, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {alerta.icon}
                <span className="text-muted-foreground truncate">{alerta.message}</span>
              </div>
              {alerta.cta && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs h-7"
                  onClick={() => navigate(alerta.cta!.path)}
                >
                  {alerta.cta.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
