import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";
import { useUserPlan } from "./useUserPlan";

export const useAvisosPublicos = () => {
  const { isVisitante } = useUserRole();
  const { plan } = useUserPlan();
  
  // Determinar o "tier" do usuário para filtrar
  const userTier = isVisitante ? 'visitante' : (plan || 'academy');

  return useQuery({
    queryKey: ["avisos-publicos", userTier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .eq("ativo", true)
        .or(`data_expiracao.is.null,data_expiracao.gt.${new Date().toISOString()}`)
        .contains("visivel_para", [userTier])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAvisosAtivosCount = () => {
  const { isVisitante, isLoading: loadingRole } = useUserRole();
  const { plan } = useUserPlan();
  
  // Determinar o "tier" do usuário para filtrar
  const userTier = isVisitante ? 'visitante' : (plan || 'academy');

  return useQuery({
    queryKey: ["avisos-ativos-count", userTier],
    queryFn: async () => {
      const { count } = await supabase
        .from("avisos")
        .select("*", { count: "exact", head: true })
        .eq("ativo", true)
        .or(`data_expiracao.is.null,data_expiracao.gt.${new Date().toISOString()}`)
        .contains("visivel_para", [userTier]);
      
      return count || 0;
    },
    enabled: !loadingRole,
  });
};
