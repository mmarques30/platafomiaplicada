import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TodasDuvidasItem {
  id: string;
  user_id: string;
  titulo: string;
  duvida: string;
  contexto: string | null;
  status: string;
  prioridade: string;
  prazo_sla: string;
  atrasada: boolean | null;
  horas_para_vencer: number | null;
  resposta_mentor: string | null;
  respondida_em: string | null;
  respondida_por: string | null;
  publicar_qa: boolean;
  categoria_qa_id: string | null;
  video_qa_url: string | null;
  publicado_qa_em: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    nome_completo: string;
    email: string | null;
  };
  categorias_qa?: {
    nome: string;
  } | null;
}

export function useTodasDuvidas() {
  const { data: duvidas, isLoading, error, refetch } = useQuery({
    queryKey: ["todas-duvidas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("duvidas_mentoria")
        .select(`
          *,
          profiles!duvidas_mentoria_user_id_fkey (
            nome_completo,
            email
          ),
          categorias_qa (
            nome
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TodasDuvidasItem[];
    },
  });

  return {
    duvidas: duvidas || [],
    isLoading,
    error,
    refetch,
  };
}
