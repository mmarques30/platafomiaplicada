import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizeEntregaPrioridade, normalizeEntregaStatus } from "@/lib/business-entregas-normalizers";

export interface EntregaBusiness {
  id: string;
  contrato_id: string;
  etapa_id?: string;
  titulo: string;
  descricao?: string;
  modulo_relacionado?: string;
  tipo: 'ativa' | 'backlog' | 'futura';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  ordem: number;
  numero_entrega?: number;
  prazo_previsto?: string;
  tem_instrucoes: boolean;
  justificativa_backlog?: string;
  created_at: string;
  updated_at: string;
}

export interface EntregaInput {
  contrato_id: string;
  etapa_id?: string;
  titulo: string;
  descricao?: string;
  modulo_relacionado?: string;
  tipo?: 'ativa' | 'backlog' | 'futura';
  status?: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';
  ordem?: number;
  numero_entrega?: number;
  prazo_previsto?: string;
  tem_instrucoes?: boolean;
  justificativa_backlog?: string;
}

const normalizeEntregaBusiness = (data: any): EntregaBusiness => ({
  ...data,
  status: normalizeEntregaStatus(data?.status),
  prioridade: normalizeEntregaPrioridade(data?.prioridade),
});

// Hook para buscar uma entrega específica por ID
export function useEntregaById(entregaId?: string) {
  return useQuery({
    queryKey: ['entrega-business', entregaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entregas_business')
        .select('*')
        .eq('id', entregaId)
        .maybeSingle();

      if (error) {
        console.error("[useEntregaById] erro ao carregar entrega:", error);
        return null;
      }
      return data ? normalizeEntregaBusiness(data) : null;
    },
    enabled: !!entregaId,
  });
}

// Hook para buscar entregas por etapa
export function useEntregasByEtapa(etapaId?: string) {
  return useQuery({
    queryKey: ['entregas-by-etapa', etapaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entregas_business')
        .select('*')
        .eq('etapa_id', etapaId)
        .order('numero_entrega', { ascending: true });

      if (error) {
        console.error("[useEntregasByEtapa] erro ao carregar entregas da etapa:", error);
        return [];
      }
      return (data ?? []).map(normalizeEntregaBusiness);
    },
    enabled: !!etapaId,
  });
}

export function useEntregasBusiness(contratoId?: string) {
  const queryClient = useQueryClient();

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ["entregas-business", contratoId],
    queryFn: async () => {
      if (!contratoId) return [];
      
      const { data, error } = await supabase
        .from("entregas_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[useEntregasBusiness] erro ao carregar entregas:", error);
        return [];
      }
      return (data ?? []).map(normalizeEntregaBusiness);
    },
    enabled: !!contratoId,
  });

  const createEntrega = useMutation({
    mutationFn: async (input: EntregaInput) => {
      const { data, error } = await supabase
        .from("entregas_business")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      toast.success("Entrega criada com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao criar entrega:", error);
      toast.error("Erro ao criar entrega");
    },
  });

  const updateEntrega = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EntregaInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("entregas_business")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      toast.success("Entrega atualizada");
    },
    onError: (error) => {
      console.error("Erro ao atualizar entrega:", error);
      toast.error("Erro ao atualizar entrega");
    },
  });

  const deleteEntrega = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("entregas_business")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      toast.success("Entrega removida");
    },
    onError: (error) => {
      console.error("Erro ao remover entrega:", error);
      toast.error("Erro ao remover entrega");
    },
  });

  const bulkCreateEntregas = useMutation({
    mutationFn: async (inputs: EntregaInput[]) => {
      const { data, error } = await supabase
        .from("entregas_business")
        .insert(inputs)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["entregas-business", contratoId] });
      toast.success(`${data.length} entregas criadas com sucesso`);
    },
    onError: (error) => {
      console.error("Erro ao criar entregas:", error);
      toast.error("Erro ao criar entregas");
    },
  });

  // Separar entregas por tipo
  const entregasAtivas = entregas.filter(e => e.tipo === 'ativa');
  const entregasBacklog = entregas.filter(e => e.tipo === 'backlog' || e.tipo === 'futura');

  // Agrupar entregas por etapa_id
  const entregasPorEtapa = entregas.reduce((acc, entrega) => {
    const etapaId = entrega.etapa_id || 'sem_etapa';
    if (!acc[etapaId]) {
      acc[etapaId] = [];
    }
    acc[etapaId].push(entrega);
    return acc;
  }, {} as Record<string, EntregaBusiness[]>);

  // Calcular progresso por etapa
  const calcularProgressoEtapa = (etapaId: string): number => {
    const entregasEtapa = entregasPorEtapa[etapaId] || [];
    if (entregasEtapa.length === 0) return 0;
    const concluidas = entregasEtapa.filter(e => e.status === 'concluida').length;
    return Math.round((concluidas / entregasEtapa.length) * 100);
  };

  return {
    entregas,
    entregasAtivas,
    entregasBacklog,
    entregasPorEtapa,
    calcularProgressoEtapa,
    isLoading,
    createEntrega,
    updateEntrega,
    deleteEntrega,
    bulkCreateEntregas,
  };
}
