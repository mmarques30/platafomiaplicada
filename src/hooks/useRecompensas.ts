import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { programa, type BonusCatalogo, type Recompensa } from "@/integrations/supabase/programa";

/** Os bônus que a pessoa pode escolher no lugar do cashback. */
export function useBonusCatalogo() {
  return useQuery({
    queryKey: ["bonus-catalogo"],
    queryFn: async () => {
      const { data, error } = await programa("bonus_catalogo")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return (data ?? []) as BonusCatalogo[];
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

/**
 * O valor do cashback de uma recompensa.
 *
 * `valor` é o que a equipe fechou. Enquanto ele não existe, dá para prever a
 * partir do valor do projeto e do percentual que a equipe registrou. Se nem
 * isso existe, não há número para mostrar, e a tela diz isso em vez de
 * inventar um.
 */
export function valorDoCashback(recompensa: Recompensa): number | null {
  if (recompensa.valor !== null) return recompensa.valor;
  if (recompensa.valor_base === null || recompensa.percentual === null) return null;
  return (recompensa.valor_base * recompensa.percentual) / 100;
}

type EscolhaRecompensa =
  | { recompensaId: string; tipo: "cashback"; valor: number }
  | { recompensaId: string; tipo: "bonus"; bonusId: string };

/**
 * Registra a escolha da pessoa entre cashback e bônus.
 *
 * A RLS só deixa mexer numa recompensa própria que ainda está em "prevista",
 * e só até "escolhida". Aprovação e pagamento continuam sendo da equipe.
 */
export function useEscolherRecompensa() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (escolha: EscolhaRecompensa) => {
      const campos =
        escolha.tipo === "cashback"
          ? { tipo: "cashback", valor: escolha.valor, bonus_id: null }
          : { tipo: "bonus", bonus_id: escolha.bonusId };

      const { error } = await programa("recompensas")
        .update({ ...campos, status: "escolhida", escolhida_em: new Date().toISOString() })
        .eq("id", escolha.recompensaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicacoes", user?.id] });
      toast({
        title: "Escolha registrada",
        description: "A equipe confirma e libera conforme o indicado paga.",
      });
    },
    onError: (erro: Error) => {
      toast({
        title: "Não deu para registrar a escolha",
        description: erro.message,
        variant: "destructive",
      });
    },
  });
}
