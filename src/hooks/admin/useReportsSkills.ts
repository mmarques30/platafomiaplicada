import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReportSkills {
  id: string;
  equipe_id: string;
  contrato_id: string | null;
  titulo: string;
  descricao: string | null;
  periodo_referencia: string | null;
  trimestre: number | null;
  data_envio: string;
  arquivo_url: string | null;
  conteudo_html: string | null;
  resumo_executivo: string | null;
  metricas: any;
  gerado_por_ia: boolean;
  created_at: string;
}

export function useReportsSkills(equipeId?: string | null) {
  const queryClient = useQueryClient();
  const qk = ["reports-skills", equipeId];

  const { data: reports = [], isLoading } = useQuery({
    queryKey: qk,
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("reports_skills")
        .select("*")
        .eq("equipe_id", equipeId)
        .order("data_envio", { ascending: false });
      if (error) throw error;
      return data as ReportSkills[];
    },
    enabled: !!equipeId,
  });

  const createReport = useMutation({
    mutationFn: async (input: Partial<ReportSkills> & { equipe_id: string; titulo: string }) => {
      const { data, error } = await supabase.from("reports_skills").insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Report criado!"); },
    onError: () => toast.error("Erro ao criar report"),
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReportSkills> }) => {
      const { error } = await supabase.from("reports_skills").update(data as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Report atualizado!"); },
    onError: () => toast.error("Erro ao atualizar report"),
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reports_skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: qk }); toast.success("Report removido!"); },
    onError: () => toast.error("Erro ao remover report"),
  });

  return { reports, isLoading, createReport, updateReport, deleteReport };
}
