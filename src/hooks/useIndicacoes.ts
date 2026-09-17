import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  programa,
  type BonusCatalogo,
  type Indicacao,
  type Recompensa,
  type RecompensaParcela,
} from "@/integrations/supabase/programa";

/** Uma indicação com o que ela gerou, do jeito que a tela precisa ler. */
export interface IndicacaoComRecompensa extends Indicacao {
  recompensa: (Recompensa & { bonus: BonusCatalogo | null; parcelas: RecompensaParcela[] }) | null;
}

export interface NovaIndicacao {
  empresa_nome: string;
  contato_nome?: string;
  contato_whatsapp?: string;
  contato_email?: string;
  observacao?: string;
}

/**
 * As indicações da pessoa, com a recompensa de cada uma.
 *
 * São consultas separadas em vez de um embed: `recompensas` tem RLS própria
 * (só o beneficiário lê) e juntar no cliente deixa explícito que uma coisa
 * pode existir sem a outra. O volume aqui é de dezenas, não de milhares.
 */
export function useIndicacoes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["indicacoes", user?.id],
    queryFn: async (): Promise<IndicacaoComRecompensa[]> => {
      if (!user) return [];

      const { data: linhas, error } = await programa("indicacoes")
        .select("*")
        .eq("indicador_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const indicacoes = (linhas ?? []) as Indicacao[];
      if (indicacoes.length === 0) return [];

      const ids = indicacoes.map((i) => i.id);

      const { data: linhasRecompensa, error: erroRecompensa } = await programa("recompensas")
        .select("*")
        .in("indicacao_id", ids);

      if (erroRecompensa) throw erroRecompensa;

      const recompensas = (linhasRecompensa ?? []) as Recompensa[];

      const idsBonus = [...new Set(recompensas.map((r) => r.bonus_id).filter(Boolean))] as string[];
      const idsRecompensa = recompensas.map((r) => r.id);

      const [{ data: linhasBonus }, { data: linhasParcela }] = await Promise.all([
        idsBonus.length
          ? programa("bonus_catalogo").select("*").in("id", idsBonus)
          : Promise.resolve({ data: [] }),
        idsRecompensa.length
          ? programa("recompensa_parcelas")
              .select("*")
              .in("recompensa_id", idsRecompensa)
              .order("previsto_para", { ascending: true })
          : Promise.resolve({ data: [] }),
      ]);

      const bonusPorId = new Map(
        ((linhasBonus ?? []) as BonusCatalogo[]).map((b) => [b.id, b]),
      );

      const parcelasPorRecompensa = new Map<string, RecompensaParcela[]>();
      for (const parcela of (linhasParcela ?? []) as RecompensaParcela[]) {
        const atuais = parcelasPorRecompensa.get(parcela.recompensa_id) ?? [];
        atuais.push(parcela);
        parcelasPorRecompensa.set(parcela.recompensa_id, atuais);
      }

      const recompensaPorIndicacao = new Map(
        recompensas.map((r) => [
          r.indicacao_id,
          {
            ...r,
            bonus: r.bonus_id ? bonusPorId.get(r.bonus_id) ?? null : null,
            parcelas: parcelasPorRecompensa.get(r.id) ?? [],
          },
        ]),
      );

      return indicacoes.map((indicacao) => ({
        ...indicacao,
        recompensa: recompensaPorIndicacao.get(indicacao.id) ?? null,
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Cria a indicação em nome de quem está logado.
 *
 * Status, responsável e valor não vêm daqui: a RLS só deixa a pessoa inserir
 * a própria linha, e quem move o funil é a equipe.
 */
export function useCriarIndicacao() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nova: NovaIndicacao) => {
      if (!user) throw new Error("Faça login para indicar.");

      const { data, error } = await programa("indicacoes")
        .insert({
          indicador_id: user.id,
          empresa_nome: nova.empresa_nome.trim(),
          contato_nome: nova.contato_nome?.trim() || null,
          contato_whatsapp: nova.contato_whatsapp?.trim() || null,
          contato_email: nova.contato_email?.trim().toLowerCase() || null,
          observacao: nova.observacao?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Indicacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicacoes", user?.id] });
      toast({
        title: "Indicação registrada",
        description: "A equipe fala com a pessoa em até 24 horas.",
      });
    },
    onError: (erro: Error) => {
      toast({
        title: "Não deu para registrar",
        description: erro.message,
        variant: "destructive",
      });
    },
  });
}

/** O histórico de status de uma indicação, para a linha do tempo. */
export function useEventosIndicacao(indicacaoId: string | null) {
  return useQuery({
    queryKey: ["indicacao-eventos", indicacaoId],
    queryFn: async () => {
      if (!indicacaoId) return [];
      const { data, error } = await programa("indicacao_eventos")
        .select("*")
        .eq("indicacao_id", indicacaoId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!indicacaoId,
    refetchOnWindowFocus: false,
  });
}
