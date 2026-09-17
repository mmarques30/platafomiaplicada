import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import {
  chamarPrograma,
  programa,
  type ProgramaPapel,
  type ProgramaRegra,
} from "@/integrations/supabase/programa";

/**
 * O papel vigente da pessoa no programa e a regra comercial que vale para ele.
 *
 * Um papel de cada vez: o índice parcial `programa_papeis_um_vigente` garante
 * que só existe uma linha aberta por pessoa, então `maybeSingle` basta. Quem
 * não tem papel nenhum recebe `papel: null` e não vê o programa.
 */
export function useProgramaPapel() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["programa-papel", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: linha, error } = await programa("programa_papeis")
        .select("*")
        .eq("user_id", user.id)
        .is("vigente_ate", null)
        .maybeSingle();

      if (error) throw error;
      if (!linha) return null;

      const papel = linha as unknown as ProgramaPapel;

      const { data: regra, error: erroRegra } = await programa("programa_regras")
        .select("*")
        .eq("papel", papel.papel)
        .maybeSingle();

      if (erroRegra) throw erroRegra;

      return { papel, regra: (regra as unknown as ProgramaRegra) ?? null };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  return {
    papel: data?.papel ?? null,
    regra: data?.regra ?? null,
    temPapel: !!data?.papel,
    isLoading,
  };
}

/**
 * A taxa que a próxima indicação fechada vale, já com a progressão aplicada.
 * A conta mora no banco (`percentual_da_proxima`) porque é regra comercial:
 * muda numa migração, não num deploy do front.
 */
export function usePercentualDaProxima() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["programa-percentual-proxima", user?.id],
    queryFn: async () => {
      const { data: taxa, error } = await chamarPrograma<number>("percentual_da_proxima");
      if (error) throw error;
      return taxa === null || taxa === undefined ? null : Number(taxa);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return { percentual: data ?? null, isLoading };
}

/** A tabela dos três formatos, para a tela que compara os caminhos. */
export function useProgramaRegras() {
  return useQuery({
    queryKey: ["programa-regras"],
    queryFn: async () => {
      const { data, error } = await programa("programa_regras").select("*").order("papel");
      if (error) throw error;
      return (data ?? []) as unknown as ProgramaRegra[];
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}
