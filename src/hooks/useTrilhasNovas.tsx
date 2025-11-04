import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTrilhasNovas = () => {
  return useQuery({
    queryKey: ["trilhas-novas"],
    queryFn: async () => {
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      
      // Buscar trilhas com seus vídeos
      const { data: trilhas, error } = await supabase
        .from("trilhas")
        .select(`
          *,
          videos:videos(id, created_at)
        `)
        .eq("ativo", true)
        .eq("visivel_mentorados", true);
      
      if (error) throw error;
      if (!trilhas) return [];
      
      // Processar trilhas para encontrar a data mais recente (trilha ou último vídeo)
      const trilhasComDataRecente = trilhas.map(trilha => {
        const dataTrilha = new Date(trilha.created_at);
        let dataUltimoVideo = dataTrilha;
        
        if (Array.isArray(trilha.videos) && trilha.videos.length > 0) {
          const datasVideos = trilha.videos.map((v: any) => new Date(v.created_at));
          dataUltimoVideo = new Date(Math.max(...datasVideos.map(d => d.getTime())));
        }
        
        const dataMaisRecente = dataUltimoVideo > dataTrilha ? dataUltimoVideo : dataTrilha;
        
        return {
          ...trilha,
          data_mais_recente: dataMaisRecente.toISOString(),
          videos_count: Array.isArray(trilha.videos) ? trilha.videos.length : 0
        };
      });
      
      // Filtrar trilhas dos últimos 30 dias e ordenar pela data mais recente
      return trilhasComDataRecente
        .filter(trilha => new Date(trilha.data_mais_recente) >= trintaDiasAtras)
        .sort((a, b) => new Date(b.data_mais_recente).getTime() - new Date(a.data_mais_recente).getTime())
        .slice(0, 10);
    }
  });
};
