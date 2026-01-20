import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface EtapaBusiness {
  id: string;
  contrato_id: string;
  numero_etapa: number;
  titulo: string;
  objetivo: string | null;
  status: 'pendente' | 'em_andamento' | 'concluida';
  data_prevista: string | null;
  data_conclusao: string | null;
  marcos_proxima_etapa: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface InstrucaoEtapa {
  id: string;
  etapa_id: string;
  titulo: string;
  descricao: string | null;
  responsavel: 'voce' | 'mentor' | 'conjunto';
  ferramenta: 'claude' | 'lovable' | 'reuniao' | 'outro' | null;
  ordem: number;
  prompt_sugerido: string | null;
  dicas: string | null;
  recursos_url: string | null;
  recursos: Json | null;
  status: 'pendente' | 'em_andamento' | 'concluida';
  gerado_por_ia: boolean;
  created_at: string;
}

export interface EtapaGeradaIA {
  numero_etapa: number;
  titulo: string;
  objetivo: string;
  data_prevista: string;
  marcos_proxima_etapa: string[];
  status: string;
}

export function useEtapasBusiness(contratoId?: string) {
  return useQuery({
    queryKey: ['etapas-business', contratoId],
    queryFn: async () => {
      let query = supabase
        .from('etapas_business')
        .select('*')
        .order('numero_etapa', { ascending: true });

      if (contratoId) {
        query = query.eq('contrato_id', contratoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EtapaBusiness[];
    },
    enabled: !!contratoId,
  });
}

export function useEtapaById(etapaId?: string) {
  return useQuery({
    queryKey: ['etapa-business', etapaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('etapas_business')
        .select('*')
        .eq('id', etapaId)
        .single();

      if (error) throw error;
      return data as EtapaBusiness;
    },
    enabled: !!etapaId,
  });
}

export function useInstrucoesEtapa(etapaId?: string) {
  return useQuery({
    queryKey: ['instrucoes-etapa', etapaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instrucoes_etapa')
        .select('*')
        .eq('etapa_id', etapaId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as InstrucaoEtapa[];
    },
    enabled: !!etapaId,
  });
}

export function useCreateEtapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (etapa: Omit<EtapaBusiness, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('etapas_business')
        .insert(etapa)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['etapas-business', variables.contrato_id] });
      toast.success('Etapa criada com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao criar etapa:', error);
      toast.error('Erro ao criar etapa');
    },
  });
}

export function useUpdateEtapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EtapaBusiness> & { id: string }) => {
      const { data, error } = await supabase
        .from('etapas_business')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['etapas-business'] });
      queryClient.invalidateQueries({ queryKey: ['etapa-business', data.id] });
      toast.success('Etapa atualizada');
    },
    onError: (error) => {
      console.error('Erro ao atualizar etapa:', error);
      toast.error('Erro ao atualizar etapa');
    },
  });
}

// Nova função para criar etapas em lote (geradas via IA)
// Retorna as etapas criadas com seus IDs para uso posterior
export function useBulkCreateEtapas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contratoId, etapas }: { 
      contratoId: string; 
      etapas: EtapaGeradaIA[] 
    }): Promise<{ data: EtapaBusiness[]; contratoId: string }> => {
      const etapasFormatadas = etapas.map(e => ({
        contrato_id: contratoId,
        numero_etapa: e.numero_etapa,
        titulo: e.titulo,
        objetivo: e.objetivo,
        data_prevista: e.data_prevista,
        marcos_proxima_etapa: e.marcos_proxima_etapa,
        status: 'pendente' as const,
      }));

      const { data, error } = await supabase
        .from('etapas_business')
        .insert(etapasFormatadas)
        .select();

      if (error) throw error;
      return { data: data as EtapaBusiness[], contratoId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['etapas-business', result.contratoId] });
    },
    onError: (error) => {
      console.error('Erro ao criar etapas em lote:', error);
      toast.error('Erro ao criar etapas');
    },
  });
}

// Hook para chamar a edge function de geração de etapas
export function useGerarEtapasIA() {
  return useMutation({
    mutationFn: async (contrato: Record<string, unknown>) => {
      const { data, error } = await supabase.functions.invoke('gerar-etapas-projeto', {
        body: { contrato },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as {
        success: boolean;
        etapas: EtapaGeradaIA[];
        meta: {
          total_etapas: number;
          dias_por_etapa: number;
          duracao_meses: number;
        };
      };
    },
    onError: (error) => {
      console.error('Erro ao gerar etapas via IA:', error);
      toast.error('Erro ao gerar etapas. Tente novamente.');
    },
  });
}

export function useCreateInstrucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instrucao: Omit<InstrucaoEtapa, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('instrucoes_etapa')
        .insert(instrucao)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instrucoes-etapa', variables.etapa_id] });
      toast.success('Instrução adicionada');
    },
    onError: (error) => {
      console.error('Erro ao criar instrução:', error);
      toast.error('Erro ao criar instrução');
    },
  });
}

export function useUpdateInstrucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, etapaId, ...updates }: Partial<InstrucaoEtapa> & { id: string; etapaId: string }) => {
      const { data, error } = await supabase
        .from('instrucoes_etapa')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, etapaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instrucoes-etapa', data.etapaId] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar instrução:', error);
      toast.error('Erro ao atualizar instrução');
    },
  });
}

export function useDeleteInstrucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, etapaId }: { id: string; etapaId: string }) => {
      const { error } = await supabase
        .from('instrucoes_etapa')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { etapaId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instrucoes-etapa', data.etapaId] });
      toast.success('Instrução removida');
    },
    onError: (error) => {
      console.error('Erro ao remover instrução:', error);
      toast.error('Erro ao remover instrução');
    },
  });
}

export function useBulkCreateInstrucoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ etapaId, instrucoes }: { 
      etapaId: string; 
      instrucoes: Array<Omit<InstrucaoEtapa, 'id' | 'created_at' | 'etapa_id'>> 
    }) => {
      const instrucoesComEtapa = instrucoes.map(i => ({
        ...i,
        etapa_id: etapaId,
        gerado_por_ia: true,
      }));

      const { data, error } = await supabase
        .from('instrucoes_etapa')
        .insert(instrucoesComEtapa)
        .select();

      if (error) throw error;
      return { data, etapaId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['instrucoes-etapa', result.etapaId] });
      toast.success(`${result.data.length} instruções criadas com sucesso`);
    },
    onError: (error) => {
      console.error('Erro ao criar instruções:', error);
      toast.error('Erro ao criar instruções');
    },
  });
}

export function useUpdateEtapaMarcos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ etapaId, marcos }: { etapaId: string; marcos: string[] }) => {
      const { data, error } = await supabase
        .from('etapas_business')
        .update({ marcos_proxima_etapa: marcos })
        .eq('id', etapaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['etapa-business', data.id] });
      queryClient.invalidateQueries({ queryKey: ['etapas-business'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar marcos:', error);
      toast.error('Erro ao atualizar marcos');
    },
  });
}
