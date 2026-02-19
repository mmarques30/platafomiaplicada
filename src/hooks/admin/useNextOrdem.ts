import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook genérico para buscar a próxima ordem disponível em uma tabela.
 */
export function useNextOrdem(
  tabela: string,
  filtro?: { campo: string; valor: string | null },
  enabled = true
) {
  return useQuery({
    queryKey: ["next-ordem", tabela, filtro?.campo, filtro?.valor],
    queryFn: async () => {
      let query = supabase
        .from(tabela as any)
        .select("ordem")
        .order("ordem", { ascending: false })
        .limit(1);

      if (filtro?.campo && filtro?.valor) {
        query = query.eq(filtro.campo, filtro.valor);
      }

      const { data, error } = await (query as any).maybeSingle();
      if (error) throw error;
      return ((data?.ordem as number) ?? 0) + 1;
    },
    enabled: enabled && (!filtro || !!filtro.valor),
  });
}
