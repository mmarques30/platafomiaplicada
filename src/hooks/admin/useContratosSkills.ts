import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProjetoPorTrilha {
  trilha_id: string;
  trilha_titulo: string;
  projetos: Array<{ titulo: string; descricao: string }>;
}

export interface ContratoSkills {
  id: string;
  equipe_id: string;
  empresa_nome: string | null;
  cnpj: string | null;
  representante_nome: string | null;
  representante_email: string | null;
  duracao_programa_semanas: number;
  frequencia_encontros: string | null;
  reports_frequencia: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  valor_contrato: number | null;
  roi_projetado: number | null;
  projetos_por_trilha: ProjetoPorTrilha[];
  entregas_esperadas: any[];
  observacoes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useContratosSkills(equipeId?: string | null) {
  const queryClient = useQueryClient();

  const { data: contrato, isLoading } = useQuery({
    queryKey: ["contrato-skills", equipeId],
    queryFn: async () => {
      if (!equipeId) return null;
      const { data, error } = await supabase
        .from("contratos_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .eq("status", "ativo")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        projetos_por_trilha: Array.isArray(data.projetos_por_trilha)
          ? (data.projetos_por_trilha as unknown as ProjetoPorTrilha[])
          : [],
        entregas_esperadas: Array.isArray(data.entregas_esperadas) ? data.entregas_esperadas : [],
      } as ContratoSkills;
    },
    enabled: !!equipeId,
  });

  const createContrato = useMutation({
    mutationFn: async (input: Partial<ContratoSkills> & { equipe_id: string }) => {
      const { data, error } = await supabase
        .from("contratos_skills")
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrato-skills", equipeId] });
      toast.success("Contrato criado com sucesso!");
    },
    onError: (e) => toast.error("Erro ao criar contrato: " + e.message),
  });

  const updateContrato = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContratoSkills> }) => {
      const { error } = await supabase
        .from("contratos_skills")
        .update(data as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrato-skills", equipeId] });
      toast.success("Contrato atualizado!");
    },
    onError: (e) => toast.error("Erro ao atualizar contrato: " + e.message),
  });

  return { contrato, isLoading, createContrato, updateContrato };
}
