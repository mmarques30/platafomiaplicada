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
  tipo?: string;
  conteudo_html?: string | null;
  metricas?: Record<string, unknown> | null;
  gerado_por_ia?: boolean;
  resumo_executivo?: string | null;
}

// Type helper para compatibilidade com Supabase Json
type JsonCompatible = string | number | boolean | null | { [key: string]: JsonCompatible } | JsonCompatible[];

export interface ReportGeradoIA {
  titulo: string;
  resumo_executivo: string;
  destaques: string[];
  proximos_passos: string[];
  observacoes: string;
  metricas: {
    etapas: { concluidas: number; total: number; percentual: number };
    entregas: { concluidas: number; total: number; percentual: number };
    tarefas: { concluidas: number; total: number };
    videos_assistidos: number;
  };
  conteudo_html: string;
  periodo_referencia: string;
}

export interface PublicLink {
  id: string;
  report_id: string;
  public_token: string;
  expires_at: string | null;
  views_count: number;
  created_at: string;
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
      const insertData = {
        contrato_id: data.contrato_id,
        titulo: data.titulo,
        descricao: data.descricao,
        arquivo_url: data.arquivo_url,
        periodo_referencia: data.periodo_referencia,
        data_envio: data.data_envio || new Date().toISOString(),
        tipo: data.tipo,
        conteudo_html: data.conteudo_html,
        metricas: data.metricas as JsonCompatible,
        gerado_por_ia: data.gerado_por_ia,
        resumo_executivo: data.resumo_executivo,
      };

      const { data: result, error } = await supabase
        .from("reports_business")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports-business", contratoId] });
      toast({
        title: "Report criado!",
        description: "O report foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar report:", error);
      toast({
        title: "Erro ao criar report",
        description: "Ocorreu um erro ao adicionar o report.",
        variant: "destructive",
      });
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReportBusinessInput> }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.metricas) {
        updateData.metricas = data.metricas as JsonCompatible;
      }

      const { data: result, error } = await supabase
        .from("reports_business")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports-business", contratoId] });
      toast({
        title: "Report atualizado!",
        description: "O report foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar report:", error);
      toast({
        title: "Erro ao atualizar report",
        description: "Ocorreu um erro ao atualizar o report.",
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
        title: "Report excluído!",
        description: "O report foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir report:", error);
      toast({
        title: "Erro ao excluir report",
        description: "Ocorreu um erro ao remover o report.",
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

// Hook para gerar report via IA
export function useGerarReportIA() {
  return useMutation({
    mutationFn: async ({ 
      contrato_id, 
      user_id, 
      periodo, 
      tipo 
    }: { 
      contrato_id: string; 
      user_id: string; 
      periodo: string; 
      tipo: 'semanal' | 'mensal' | 'trimestral';
    }) => {
      const { data, error } = await supabase.functions.invoke('gerar-report-business', {
        body: { contrato_id, user_id, periodo, tipo },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as ReportGeradoIA;
    },
    onError: (error) => {
      console.error('Erro ao gerar report via IA:', error);
      toast({
        title: "Erro ao gerar report",
        description: "Não foi possível gerar o report. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

// Hook para criar link público
export function useCreatePublicLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, expiresInDays }: { reportId: string; expiresInDays?: number }) => {
      const publicToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from("reports_public_links")
        .insert({
          report_id: reportId,
          public_token: publicToken,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PublicLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-public-links"] });
      toast({
        title: "Link criado!",
        description: "O link público foi gerado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar link público:", error);
      toast({
        title: "Erro ao criar link",
        description: "Não foi possível gerar o link público.",
        variant: "destructive",
      });
    },
  });
}

// Hook para buscar links públicos de um report
export function usePublicLinks(reportId?: string) {
  return useQuery({
    queryKey: ["report-public-links", reportId],
    queryFn: async () => {
      if (!reportId) return [];

      const { data, error } = await supabase
        .from("reports_public_links")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PublicLink[];
    },
    enabled: !!reportId,
  });
}

// Hook para buscar report por token público
export function useReportByToken(token?: string) {
  return useQuery({
    queryKey: ["report-by-token", token],
    queryFn: async () => {
      if (!token) return null;

      // Buscar link público
      const { data: linkData, error: linkError } = await supabase
        .from("reports_public_links")
        .select("*, reports_business(*)")
        .eq("public_token", token)
        .single();

      if (linkError) throw linkError;

      // Verificar expiração
      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        throw new Error("Link expirado");
      }

      // Incrementar visualizações
      await supabase
        .from("reports_public_links")
        .update({ views_count: (linkData.views_count || 0) + 1 })
        .eq("id", linkData.id);

      return linkData.reports_business as ReportBusiness;
    },
    enabled: !!token,
  });
}
