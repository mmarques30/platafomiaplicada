import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ReportBusiness } from "./useContratosBusiness";

export interface ReportBusinessInput {
  contrato_id: string;
  titulo: string;
  descricao?: string | null;
  arquivo_url?: string | null;
  periodo_referencia?: string | null;
  data_envio?: string;
}

export function useReportsBusinessMutations(contratoId?: string) {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports-business", contratoId],
    queryFn: async () => {
      if (!contratoId) return [];

      const { data, error } = await supabase
        .from("reports_business")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("data_envio", { ascending: false });

      if (error) throw error;
      return data as ReportBusiness[];
    },
    enabled: !!contratoId,
  });

  const createReport = useMutation({
    mutationFn: async (data: ReportBusinessInput) => {
      const { data: result, error } = await supabase
        .from("reports_business")
        .insert({
          ...data,
          data_envio: data.data_envio || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports-business", contratoId] });
      toast({
        title: "Documento criado!",
        description: "O documento foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar documento:", error);
      toast({
        title: "Erro ao criar documento",
        description: "Ocorreu um erro ao adicionar o documento.",
        variant: "destructive",
      });
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReportBusinessInput> }) => {
      const { data: result, error } = await supabase
        .from("reports_business")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports-business", contratoId] });
      toast({
        title: "Documento atualizado!",
        description: "O documento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar documento:", error);
      toast({
        title: "Erro ao atualizar documento",
        description: "Ocorreu um erro ao atualizar o documento.",
        variant: "destructive",
      });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reports_business")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports-business", contratoId] });
      toast({
        title: "Documento excluído!",
        description: "O documento foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir documento:", error);
      toast({
        title: "Erro ao excluir documento",
        description: "Ocorreu um erro ao remover o documento.",
        variant: "destructive",
      });
    },
  });

  return {
    reports,
    isLoading,
    createReport,
    updateReport,
    deleteReport,
  };
}
