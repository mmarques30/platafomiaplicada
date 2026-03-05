import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEntregasBusinessView(contratoId: string | undefined) {
  const { data: processos = [], isLoading: loadingProcessos } = useQuery({
    queryKey: ["processos-mapeados", contratoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos_mapeados_business")
        .select("*")
        .eq("contrato_id", contratoId!)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!contratoId,
  });

  const { data: telas = [], isLoading: loadingTelas } = useQuery({
    queryKey: ["telas-sistema", contratoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telas_sistema_business")
        .select("*")
        .eq("contrato_id", contratoId!)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!contratoId,
  });

  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ["videos-instrucao", contratoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos_instrucao_business")
        .select("*")
        .eq("contrato_id", contratoId!)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!contratoId,
  });

  return {
    processos,
    telas,
    videos,
    isLoading: loadingProcessos || loadingTelas || loadingVideos,
  };
}
