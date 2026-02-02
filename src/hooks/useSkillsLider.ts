import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsMembro } from "./useSkillsMembro";
import { toast } from "sonner";

export function useSkillsLider() {
  const { equipeId, isLider } = useSkillsMembro();
  const queryClient = useQueryClient();

  // Entregas aguardando validação
  const { data: entregasParaValidar, isLoading: loadingValidar } = useQuery({
    queryKey: ["entregas-validar", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("entregas_skills")
        .select(`
          *,
          responsavel:responsavel_id (id, nome, avatar_url)
        `)
        .eq("equipe_id", equipeId)
        .eq("status", "aguardando_validacao")
        .order("prazo", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!equipeId && isLider,
  });

  // Progresso de cada membro
  const { data: progressoMembros, isLoading: loadingProgresso } = useQuery({
    queryKey: ["progresso-membros", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      
      // Buscar membros
      const { data: membrosData, error: membrosError } = await supabase
        .from("membros_equipe_skills")
        .select(`
          id,
          user_id,
          cargo,
          papel,
          profiles:user_id (id, nome, avatar_url)
        `)
        .eq("equipe_id", equipeId)
        .eq("status", "ativo");
      
      if (membrosError) throw membrosError;
      
      // Buscar diagnósticos
      const { data: diagnosticosData } = await supabase
        .from("diagnosticos_skills")
        .select("user_id, completado")
        .eq("equipe_id", equipeId);
      
      // Buscar entregas por responsável
      const { data: entregasData } = await supabase
        .from("entregas_skills")
        .select("responsavel_id, status")
        .eq("equipe_id", equipeId);
      
      // Mapear progresso
      return membrosData?.map((m: any) => {
        const userEntregas = entregasData?.filter(e => e.responsavel_id === m.user_id) || [];
        const entregasConcluidas = userEntregas.filter(e => e.status === "aprovada").length;
        const totalEntregas = userEntregas.length;
        
        return {
          id: m.id,
          user_id: m.user_id,
          nome: m.profiles?.nome || "Usuário",
          avatar_url: m.profiles?.avatar_url,
          cargo: m.cargo,
          papel: m.papel,
          diagnostico_completo: diagnosticosData?.find(d => d.user_id === m.user_id)?.completado || false,
          entregas_concluidas: entregasConcluidas,
          total_entregas: totalEntregas,
        };
      }) || [];
    },
    enabled: !!equipeId && isLider,
  });

  // Alertas de atraso
  const { data: alertasAtraso, isLoading: loadingAlertas } = useQuery({
    queryKey: ["alertas-atraso", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const hoje = new Date().toISOString();
      const { data, error } = await supabase
        .from("entregas_skills")
        .select(`
          *,
          responsavel:responsavel_id (id, nome, avatar_url)
        `)
        .eq("equipe_id", equipeId)
        .in("status", ["pendente", "em_andamento"])
        .lt("prazo", hoje)
        .order("prazo", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!equipeId && isLider,
  });

  // Métricas consolidadas
  const { data: metricas, isLoading: loadingMetricas } = useQuery({
    queryKey: ["metricas-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return null;
      
      // Buscar todas as entregas
      const { data: entregas } = await supabase
        .from("entregas_skills")
        .select("status")
        .eq("equipe_id", equipeId);
      
      // Buscar consolidado para horas economizadas
      const { data: consolidado } = await supabase
        .from("diagnostico_consolidado_skills")
        .select("potencial_economia_horas")
        .eq("equipe_id", equipeId)
        .maybeSingle();
      
      const totalEntregas = entregas?.length || 0;
      const entregasAprovadas = entregas?.filter(e => e.status === "aprovada").length || 0;
      const entregasParaValidar = entregas?.filter(e => e.status === "aguardando_validacao").length || 0;
      const entregasAtrasadas = alertasAtraso?.length || 0;
      
      return {
        totalEntregas,
        entregasAprovadas,
        entregasParaValidar,
        entregasAtrasadas,
        horasEconomizadas: consolidado?.potencial_economia_horas || 0,
      };
    },
    enabled: !!equipeId && isLider,
  });

  // Mutation para aprovar entrega
  const aprovarEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({
          status: "aprovada",
          aprovado_em: new Date().toISOString(),
        })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega aprovada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["entregas-validar"] });
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
      queryClient.invalidateQueries({ queryKey: ["metricas-skills"] });
      queryClient.invalidateQueries({ queryKey: ["progresso-membros"] });
    },
    onError: () => {
      toast.error("Erro ao aprovar entrega");
    },
  });

  // Mutation para rejeitar entrega (volta para em_andamento)
  const rejeitarEntrega = useMutation({
    mutationFn: async (entregaId: string) => {
      const { error } = await supabase
        .from("entregas_skills")
        .update({ status: "em_andamento" })
        .eq("id", entregaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entrega devolvida para revisão");
      queryClient.invalidateQueries({ queryKey: ["entregas-validar"] });
      queryClient.invalidateQueries({ queryKey: ["entregas-skills"] });
      queryClient.invalidateQueries({ queryKey: ["metricas-skills"] });
    },
    onError: () => {
      toast.error("Erro ao rejeitar entrega");
    },
  });

  return {
    entregasParaValidar,
    progressoMembros,
    alertasAtraso,
    metricas,
    isLoading: loadingValidar || loadingProgresso || loadingAlertas || loadingMetricas,
    aprovarEntrega,
    rejeitarEntrega,
    isLider,
  };
}
