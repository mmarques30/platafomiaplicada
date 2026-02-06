import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { useUserRole } from "./useUserRole";

export function useSquadMembro() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  
  // Obter contexto de simulação (admin visualizando como outro usuário)
  let impersonatedUserId: string | null = null;
  let isViewingAs = false;
  
  try {
    const context = useAdminViewContext();
    impersonatedUserId = context.impersonatedUserId;
    isViewingAs = context.isViewingAs;
  } catch {
    // Context não disponível
  }
  
  // Se admin está simulando outro usuário, usar o ID do usuário simulado
  const effectiveUserId = (isAdmin && isViewingAs && impersonatedUserId) 
    ? impersonatedUserId 
    : user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["squad-membro", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;
      
      // Primeiro verificar se é líder de algum squad
      const { data: squadLider, error: squadError } = await supabase
        .from("squads")
        .select("id, nome, empresa_nome, data_inicio, data_fim, investimento, custo_hora_padrao, status")
        .eq("lider_id", effectiveUserId)
        .eq("status", "ativo")
        .maybeSingle();
      
      if (squadError) throw squadError;
      
      if (squadLider) {
        return {
          squadId: squadLider.id,
          squadNome: squadLider.nome,
          empresaNome: squadLider.empresa_nome,
          dataInicio: squadLider.data_inicio,
          dataFim: squadLider.data_fim,
          investimento: squadLider.investimento,
          custoHora: squadLider.custo_hora_padrao,
          papel: "lider" as const,
          cargo: null,
          status: squadLider.status,
        };
      }
      
      // Se não é líder, verificar se é membro
      const { data: membroData, error: membroError } = await supabase
        .from("membros_squad")
        .select(`
          squad_id,
          cargo,
          papel,
          status,
          squads!inner (
            id, nome, empresa_nome, data_inicio, data_fim, investimento, custo_hora_padrao, status
          )
        `)
        .eq("user_id", effectiveUserId)
        .eq("status", "ativo")
        .maybeSingle();
      
      if (membroError) throw membroError;
      
      if (membroData && membroData.squads) {
        const squad = membroData.squads as any;
        return {
          squadId: squad.id,
          squadNome: squad.nome,
          empresaNome: squad.empresa_nome,
          dataInicio: squad.data_inicio,
          dataFim: squad.data_fim,
          investimento: squad.investimento,
          custoHora: squad.custo_hora_padrao,
          papel: membroData.papel as "lider" | "membro",
          cargo: membroData.cargo,
          status: membroData.status,
        };
      }
      
      return null;
    },
    enabled: !!effectiveUserId,
  });

  return {
    squadId: data?.squadId ?? null,
    squadNome: data?.squadNome ?? null,
    empresaNome: data?.empresaNome ?? null,
    dataInicio: data?.dataInicio ?? null,
    dataFim: data?.dataFim ?? null,
    investimento: data?.investimento ?? 0,
    custoHora: data?.custoHora ?? 60,
    papel: data?.papel ?? null,
    isLider: data?.papel === "lider",
    isMembro: data?.papel === "membro",
    cargo: data?.cargo ?? null,
    isLoading,
  };
}
