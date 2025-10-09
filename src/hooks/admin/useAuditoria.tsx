import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAuditoria(tabela?: string, registroId?: string) {
  return useQuery({
    queryKey: ["auditoria", tabela, registroId],
    queryFn: async () => {
      let query = supabase
        .from("auditoria_conteudo")
        .select(`
          *,
          profiles:user_id(nome_completo)
        `)
        .order("created_at", { ascending: false });

      if (tabela) {
        query = query.eq("tabela", tabela);
      }

      if (registroId) {
        query = query.eq("registro_id", registroId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(tabela && registroId),
  });
}
