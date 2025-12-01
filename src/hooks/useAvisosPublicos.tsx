import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAvisosPublicos = () => {
  return useQuery({
    queryKey: ["avisos-publicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .eq("ativo", true)
        .or(`data_expiracao.is.null,data_expiracao.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAvisosAtivosCount = () => {
  return useQuery({
    queryKey: ["avisos-ativos-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("avisos")
        .select("*", { count: "exact", head: true })
        .eq("ativo", true)
        .or(`data_expiracao.is.null,data_expiracao.gt.${new Date().toISOString()}`);
      
      return count || 0;
    },
  });
};
