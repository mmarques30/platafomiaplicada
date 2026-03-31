import { useMemo } from "react";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";
import { useMentoriaSessoes } from "@/hooks/useMentoriaSessoes";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useTasksByUser } from "@/hooks/useTasksBusiness";
import { differenceInDays, differenceInHours, isFuture, parseISO } from "date-fns";

interface UseMentoriaContextOptions {
  enabled: boolean;
}

interface MentoriaContextResult {
  contextText: string | null;
  proactiveMessage: string | null;
  isLoading: boolean;
}

export function useMentoriaContext({ enabled }: UseMentoriaContextOptions): MentoriaContextResult {
  const businessUserId = useBusinessUserId();

  const { contrato } = useContratosBusiness(enabled ? businessUserId : undefined);
  const contratoId = contrato?.id;

  const { data: entregas } = useEntregasBusiness(enabled ? contratoId : undefined);
  const { sessoes } = useMentoriaSessoes(enabled ? businessUserId : undefined);
  const { data: etapas } = useEtapasBusiness(enabled ? contratoId : undefined);
  const { data: tasks } = useTasksByUser(enabled ? businessUserId : undefined);

  return useMemo(() => {
    if (!enabled) return { contextText: null, proactiveMessage: null, isLoading: false };

    const now = new Date();

    // Próxima sessão agendada (futura mais próxima)
    const proximaSessao = sessoes
      ?.filter((s) => s.status === "agendada" && isFuture(parseISO(s.data_sessao)))
      .sort((a, b) => parseISO(a.data_sessao).getTime() - parseISO(b.data_sessao).getTime())[0] ?? null;

    // Próxima entrega pendente com prazo
    const proximaEntrega = entregas
      ?.filter((e) => e.status === "pendente" && e.prazo_previsto)
      .sort((a, b) => parseISO(a.prazo_previsto!).getTime() - parseISO(b.prazo_previsto!).getTime())[0] ?? null;

    // Etapa atual
    const etapaAtual = etapas?.find((e) => e.status === "em_andamento") ?? null;

    // Tarefas críticas/urgentes pendentes
    const tarefasCriticas = tasks?.filter(
      (t) => (t.prioridade === "urgente" || t.prioridade === "alta") && t.status === "pendente"
    ) ?? [];

    // Build context text for system prompt
    const parts: string[] = [];
    if (proximaSessao) {
      const horasAte = differenceInHours(parseISO(proximaSessao.data_sessao), now);
      parts.push(`Próxima sessão: "${proximaSessao.titulo}" em ${horasAte}h`);
    }
    if (proximaEntrega) {
      const diasAte = differenceInDays(parseISO(proximaEntrega.prazo_previsto!), now);
      parts.push(`Próxima entrega: "${proximaEntrega.titulo}" em ${diasAte} dia(s)`);
    }
    if (etapaAtual) {
      parts.push(`Etapa atual: "${etapaAtual.titulo}" (etapa ${etapaAtual.numero_etapa})`);
    }
    if (tarefasCriticas.length > 0) {
      parts.push(`Tarefas críticas/urgentes pendentes: ${tarefasCriticas.length}`);
    }

    const contextText = parts.length > 0 ? parts.join("\n") : null;

    // Proactive message (priority order)
    let proactiveMessage: string | null = null;

    if (proximaSessao) {
      const horasAte = differenceInHours(parseISO(proximaSessao.data_sessao), now);
      if (horasAte <= 24 && horasAte > 0) {
        proactiveMessage = `Sua próxima sessão é amanhã. Tem algo que quer preparar?`;
      }
    }

    if (!proactiveMessage && proximaEntrega) {
      const diasAte = differenceInDays(parseISO(proximaEntrega.prazo_previsto!), now);
      if (diasAte <= 3 && diasAte >= 0) {
        proactiveMessage = `Sua próxima entrega "${proximaEntrega.titulo}" vence em ${diasAte} dia(s). Quer revisar o que precisa ser entregue?`;
      }
    }

    if (!proactiveMessage && tarefasCriticas.length > 0) {
      proactiveMessage = `Você tem ${tarefasCriticas.length} tarefa(s) crítica(s) em aberto. Quer ver o que está pendente?`;
    }

    return { contextText, proactiveMessage, isLoading: false };
  }, [enabled, entregas, sessoes, etapas, tasks]);
}
