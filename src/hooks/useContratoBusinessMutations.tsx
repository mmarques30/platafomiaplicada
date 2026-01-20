import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EntregaEsperada } from "./useContratosBusiness";
import { Json } from "@/integrations/supabase/types";

export interface ContratoBusinessInput {
  user_id: string;
  modulos_contratados: number;
  tempo_consultoria_meses: number;
  reunioes_mensais: number;
  reports_frequencia: string;
  suporte_tipo: string;
  data_inicio?: string | null;
  data_fim?: string | null;
  valor_contrato?: number | null;
  roi_projetado?: number | null;
  observacoes?: string | null;
  entregas_esperadas?: EntregaEsperada[];
  status?: string;
}

// Helper to convert EntregaEsperada[] to Json
const entregasToJson = (entregas: EntregaEsperada[]): Json => {
  return entregas.map(e => ({
    titulo: e.titulo,
    prazo: e.prazo,
    tipo: e.tipo,
    status: e.status,
  })) as unknown as Json;
};

export function useContratoBusinessMutations() {
  const queryClient = useQueryClient();

  const createContrato = useMutation({
    mutationFn: async (data: ContratoBusinessInput) => {
      const { entregas_esperadas, ...rest } = data;
      
      const { data: result, error } = await supabase
        .from("contratos_business")
        .insert({
          ...rest,
          entregas_esperadas: entregas_esperadas ? entregasToJson(entregas_esperadas) : [],
          status: data.status || "ativo",
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contrato-business", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ["etapas-business"] });
      toast({
        title: "Contrato criado!",
        description: "O contrato foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar contrato:", error);
      toast({
        title: "Erro ao criar contrato",
        description: "Ocorreu um erro ao criar o contrato.",
        variant: "destructive",
      });
    },
  });

  const updateContrato = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContratoBusinessInput> }) => {
      const { entregas_esperadas, ...rest } = data;
      
      const updateData: Record<string, unknown> = {
        ...rest,
        updated_at: new Date().toISOString(),
      };
      
      if (entregas_esperadas !== undefined) {
        updateData.entregas_esperadas = entregasToJson(entregas_esperadas);
      }

      const { data: result, error } = await supabase
        .from("contratos_business")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contrato-business", result.user_id] });
      queryClient.invalidateQueries({ queryKey: ["etapas-business"] });
      toast({
        title: "Contrato atualizado!",
        description: "O contrato foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar contrato:", error);
      toast({
        title: "Erro ao atualizar contrato",
        description: "Ocorreu um erro ao atualizar o contrato.",
        variant: "destructive",
      });
    },
  });

  const updateEntregas = useMutation({
    mutationFn: async ({ contratoId, entregas }: { contratoId: string; entregas: EntregaEsperada[] }) => {
      const { data: result, error } = await supabase
        .from("contratos_business")
        .update({
          entregas_esperadas: entregasToJson(entregas),
          updated_at: new Date().toISOString(),
        })
        .eq("id", contratoId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contrato-business", result.user_id] });
      toast({
        title: "Entregas atualizadas!",
        description: "As entregas esperadas foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar entregas:", error);
      toast({
        title: "Erro ao atualizar entregas",
        description: "Ocorreu um erro ao atualizar as entregas.",
        variant: "destructive",
      });
    },
  });

  return {
    createContrato,
    updateContrato,
    updateEntregas,
  };
}
