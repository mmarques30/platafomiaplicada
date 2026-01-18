import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";
import { useEffectivePlan } from "./useUserPlan";

export const useAvisosPublicos = () => {
  const { isAdmin } = useUserRole();
  const { effectivePlan, isVisitante } = useEffectivePlan(isAdmin);
  
  // Determinar o "tier" do usuário para filtrar (considera simulação admin)
  const userTier = isVisitante ? 'visitante' : (effectivePlan || 'academy');

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
  const { isAdmin, isLoading: loadingRole } = useUserRole();
  const { effectivePlan, isVisitante } = useEffectivePlan(isAdmin);
  
  // Determinar o "tier" do usuário para filtrar (considera simulação admin)
  const userTier = isVisitante ? 'visitante' : (effectivePlan || 'academy');

  return useQuery({
    queryKey: ["avisos-ativos-count", userTier],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Buscar avisos ativos
      const { data: avisos, error: avisosError } = await supabase
        .from("avisos")
        .select("id")
        .eq("ativo", true)
        .or(`data_expiracao.is.null,data_expiracao.gt.${new Date().toISOString()}`)
        .contains("visivel_para", [userTier]);
      
      if (avisosError) throw avisosError;
      if (!avisos || avisos.length === 0) return 0;

      // Buscar avisos já lidos pelo usuário
      const avisoIds = avisos.map(a => a.id);
      const { data: lidos, error: lidosError } = await supabase
        .from("avisos_lidos")
        .select("aviso_id")
        .eq("user_id", user.id)
        .in("aviso_id", avisoIds);

      if (lidosError) throw lidosError;

      // Contar apenas avisos não lidos
      const lidosSet = new Set(lidos?.map(l => l.aviso_id) || []);
      const naoLidos = avisos.filter(a => !lidosSet.has(a.id));
      
      return naoLidos.length;
    },
    enabled: !loadingRole,
  });
};

export const useMarcarAvisosComoLidos = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (avisoIds: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || avisoIds.length === 0) return;
      
      // Inserir registros para cada aviso não lido (ignorar duplicatas)
      const inserts = avisoIds.map(avisoId => ({
        user_id: user.id,
        aviso_id: avisoId
      }));
      
      // Usar upsert para ignorar conflitos (avisos já lidos)
      const { error } = await supabase
        .from("avisos_lidos")
        .upsert(inserts, { 
          onConflict: 'user_id,aviso_id',
          ignoreDuplicates: true 
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar contador para atualizar no header
      queryClient.invalidateQueries({ queryKey: ["avisos-ativos-count"] });
    }
  });
};
