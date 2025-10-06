import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVideoAnalytics() {
  return useQuery({
    queryKey: ["video-analytics"],
    queryFn: async () => {
      // Buscar todos os progressos com joins
      const { data: progressos, error } = await supabase
        .from("progresso_videos")
        .select(`
          *,
          video:videos(
            id,
            titulo,
            duracao,
            trilha:trilhas(id, titulo)
          )
        `);

      if (error) throw error;

      // Calcular métricas
      const totalHoras = progressos.reduce((acc, p) => acc + (p.tempo_assistido || 0), 0) / 3600;
      const totalVisualizacoes = progressos.length;
      const totalCompletados = progressos.filter((p) => p.completado).length;
      const taxaConclusao = totalVisualizacoes > 0 
        ? ((totalCompletados / totalVisualizacoes) * 100).toFixed(1)
        : "0";

      // Top 10 vídeos mais assistidos
      const videoStats = progressos.reduce((acc: any, p) => {
        const videoId = p.video?.id;
        if (!videoId) return acc;

        if (!acc[videoId]) {
          acc[videoId] = {
            id: videoId,
            titulo: p.video.titulo,
            visualizacoes: 0,
            tempoTotal: 0,
            completados: 0,
            trilha: p.video.trilha?.titulo || "Sem trilha",
          };
        }

        acc[videoId].visualizacoes++;
        acc[videoId].tempoTotal += p.tempo_assistido || 0;
        if (p.completado) acc[videoId].completados++;

        return acc;
      }, {});

      const topVideos = Object.values(videoStats)
        .sort((a: any, b: any) => b.visualizacoes - a.visualizacoes)
        .slice(0, 10);

      const videoMaisAssistido = topVideos[0] || null;

      // Distribuição por trilha
      const trilhaStats = progressos.reduce((acc: any, p) => {
        const trilha = p.video?.trilha?.titulo || "Sem trilha";
        if (!acc[trilha]) {
          acc[trilha] = {
            nome: trilha,
            tempo: 0,
            alunos: new Set(),
          };
        }
        acc[trilha].tempo += p.tempo_assistido || 0;
        acc[trilha].alunos.add(p.user_id);
        return acc;
      }, {});

      const distribuicaoTrilhas = Object.values(trilhaStats).map((t: any) => ({
        nome: t.nome,
        tempo: t.tempo / 3600,
        alunos: t.alunos.size,
      }));

      const trilhaMaisPopular = distribuicaoTrilhas.sort((a: any, b: any) => b.tempo - a.tempo)[0] || null;

      return {
        totalHoras: totalHoras.toFixed(1),
        taxaConclusao,
        videoMaisAssistido,
        trilhaMaisPopular,
        topVideos,
        distribuicaoTrilhas,
        tabelaDetalhada: topVideos.map((v: any) => ({
          ...v,
          tempoMedio: (v.tempoTotal / v.visualizacoes / 60).toFixed(1), // em minutos
          taxaConclusao: ((v.completados / v.visualizacoes) * 100).toFixed(1),
        })),
      };
    },
  });
}
