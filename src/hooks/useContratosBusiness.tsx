import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface EntregaEsperada {
  titulo: string;
  prazo: string;
  tipo: string;
  status: "pendente" | "em_andamento" | "concluida";
}

export interface ContratoBusiness {
  id: string;
  user_id: string;
  modulos_contratados: number;
  tempo_consultoria_meses: number;
  entregas_esperadas: EntregaEsperada[];
  reunioes_mensais: number;
  reports_frequencia: string;
  suporte_tipo: string;
  data_inicio: string | null;
  data_fim: string | null;
  status: string;
  valor_contrato: number | null;
  roi_projetado: number | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportBusiness {
  id: string;
  contrato_id: string;
  titulo: string;
  descricao: string | null;
  arquivo_url: string | null;
  periodo_referencia: string | null;
  data_envio: string;
  created_at: string;
}

export function useContratosBusiness(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data: contrato, isLoading: isLoadingContrato } = useQuery({
    queryKey: ["contrato-business", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from("contratos_business")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("status", "ativo")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Parse entregas_esperadas from JSONB
      return {
        ...data,
        entregas_esperadas: Array.isArray(data.entregas_esperadas) 
          ? data.entregas_esperadas as unknown as EntregaEsperada[]
          : []
      } as ContratoBusiness;
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["reports-business", contrato?.id],
    queryFn: async () => {
      if (!contrato?.id) return [];
      
      const { data, error } = await supabase
        .from("reports_business")
        .select("*")
        .eq("contrato_id", contrato.id)
        .order("data_envio", { ascending: false });

      if (error) throw error;
      return data as ReportBusiness[];
    },
    enabled: !!contrato?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Calcular métricas do contrato
  const calcularProgresso = () => {
    if (!contrato) return { modulosConcluidos: 0, percentual: 0 };
    
    const entregas = contrato.entregas_esperadas || [];
    const concluidas = entregas.filter(e => e.status === "concluida").length;
    const total = entregas.length || 1;
    
    return {
      modulosConcluidos: concluidas,
      percentual: Math.round((concluidas / total) * 100)
    };
  };

  const calcularTempoRestante = () => {
    if (!contrato?.data_fim) return null;
    
    const hoje = new Date();
    const fim = new Date(contrato.data_fim);
    const diffTime = fim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { dias: 0, meses: 0, expirado: true };
    
    return {
      dias: diffDays,
      meses: Math.ceil(diffDays / 30),
      expirado: false
    };
  };

  return {
    contrato,
    reports: reports || [],
    isLoading: isLoadingContrato || isLoadingReports,
    progresso: calcularProgresso(),
    tempoRestante: calcularTempoRestante(),
  };
}
