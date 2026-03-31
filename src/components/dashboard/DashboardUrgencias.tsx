import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useMentoriaTarefas } from "@/hooks/useMentoriaTarefas";
import { useTasksByUser } from "@/hooks/useTasksBusiness";

type UrgencyItem = {
  text: string;
  link: string;
  linkLabel: string;
};

export function DashboardUrgencias() {
  const { user } = useAuth();
  const { isBusiness, isLoading: planLoading } = useUserPlan();

  const { tarefas } = useMentoriaTarefas(user?.id);
  const { data: tasksBusiness } = useTasksByUser(isBusiness ? user?.id : undefined);

  const urgency = useMemo<UrgencyItem | null>(() => {
    if (planLoading) return null;

    const now = Date.now();
    const in48h = now + 48 * 60 * 60 * 1000;

    // 1. Academy tasks due in 48h
    if (tarefas?.length) {
      const urgent = tarefas.find((t) => {
        if (t.status !== "pendente" && t.status !== "em_andamento") return false;
        if (!t.prazo_entrega) return false;
        const prazo = new Date(t.prazo_entrega).getTime();
        return prazo <= in48h && prazo >= now;
      });
      if (urgent) {
        return {
          text: `Tarefa "${urgent.titulo}" vence em breve`,
          link: "/mentoria/tarefas",
          linkLabel: "Ver tarefa",
        };
      }
    }

    // 2. Business tasks due in 48h
    if (isBusiness && tasksBusiness?.length) {
      const urgent = tasksBusiness.find((t) => {
        if (t.status !== "pendente") return false;
        if (!t.prazo) return false;
        const prazo = new Date(t.prazo).getTime();
        return prazo <= in48h && prazo >= now;
      });
      if (urgent) {
        return {
          text: `Tarefa "${urgent.titulo}" vence em breve`,
          link: "/mentoria/tarefas-business",
          linkLabel: "Ver tarefa",
        };
      }
    }

    // 3. Diagnostico not filled
    if (!formulario || formulario.completado === false) {
      return {
        text: "Preencha seu diagnóstico para personalizar sua jornada",
        link: "/meu-diagnostico",
        linkLabel: "Preencher diagnóstico",
      };
    }

    return null;
  }, [tarefas, tasksBusiness, formulario, isBusiness, planLoading, formLoading]);

  if (!urgency) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#E8684A] bg-card px-4 h-12 shadow-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-[#E8684A]" />
      <span className="flex-1 truncate text-sm text-foreground">{urgency.text}</span>
      <Link
        to={urgency.link}
        className="inline-flex items-center gap-1 shrink-0 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {urgency.linkLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
