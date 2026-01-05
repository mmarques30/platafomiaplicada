import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEngajamentoCompleto() {
  return useQuery({
    queryKey: ["engajamento-completo"],
    queryFn: async () => {
      // ========== VÍDEOS ==========
      const { data: progressos, error: progressosError } = await supabase
        .from("progresso_videos")
        .select(`
          *,
          video:videos(id, titulo, duracao, trilha:trilhas(id, titulo))
        `);

      if (progressosError) throw progressosError;

      const totalHoras = progressos.reduce((acc, p) => acc + (p.tempo_assistido || 0), 0) / 3600;
      const totalVisualizacoes = progressos.length;
      const totalCompletados = progressos.filter((p) => p.completado).length;
      const taxaConclusao = totalVisualizacoes > 0 
        ? ((totalCompletados / totalVisualizacoes) * 100).toFixed(1)
        : "0";

      // Top 10 vídeos
      const videoStats = progressos.reduce((acc: Record<string, any>, p) => {
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
        .slice(0, 10)
        .map((v: any) => ({
          ...v,
          tempoMedio: (v.tempoTotal / v.visualizacoes / 60).toFixed(1),
          taxaConclusao: ((v.completados / v.visualizacoes) * 100).toFixed(1),
        }));

      // Distribuição por trilha
      const trilhaStats = progressos.reduce((acc: Record<string, any>, p) => {
        const trilha = p.video?.trilha?.titulo || "Sem trilha";
        if (!acc[trilha]) {
          acc[trilha] = { nome: trilha, tempo: 0, alunos: new Set() };
        }
        acc[trilha].tempo += p.tempo_assistido || 0;
        acc[trilha].alunos.add(p.user_id);
        return acc;
      }, {});

      const distribuicaoTrilhas = Object.values(trilhaStats)
        .map((t: any) => ({
          nome: t.nome,
          tempo: t.tempo / 3600,
          alunos: t.alunos.size,
        }))
        .sort((a, b) => b.tempo - a.tempo);

      // ========== FERRAMENTAS AVALIADAS ==========
      const { data: ferramentas, error: ferramentasError } = await supabase
        .from("ferramentas_ia")
        .select("id, nome, categoria, avaliacao_comunidade, total_avaliacoes_comunidade")
        .eq("ativo", true)
        .order("total_avaliacoes_comunidade", { ascending: false });

      if (ferramentasError) throw ferramentasError;

      const ferramentasComAvaliacao = ferramentas?.filter(f => (f.total_avaliacoes_comunidade || 0) > 0) || [];
      const totalAvaliacoesFerramentas = ferramentasComAvaliacao.reduce((acc, f) => acc + (f.total_avaliacoes_comunidade || 0), 0);
      const mediaGeralFerramentas = ferramentasComAvaliacao.length > 0
        ? ferramentasComAvaliacao.reduce((acc, f) => acc + (f.avaliacao_comunidade || 0) * (f.total_avaliacoes_comunidade || 0), 0) / totalAvaliacoesFerramentas
        : 0;

      const topFerramentas = ferramentasComAvaliacao.slice(0, 10);

      // ========== FAVORITOS ==========
      const { data: favoritos, error: favoritosError } = await supabase
        .from("favoritos")
        .select("*");

      if (favoritosError) throw favoritosError;

      const totalFavoritos = favoritos?.length || 0;
      const favoritosPorTipo = (favoritos || []).reduce((acc: Record<string, number>, f) => {
        acc[f.tipo] = (acc[f.tipo] || 0) + 1;
        return acc;
      }, {});

      // Top favoritos por item
      const favoritosPorItem = (favoritos || []).reduce((acc: Record<string, { tipo: string; count: number }>, f) => {
        const key = `${f.tipo}-${f.item_id}`;
        if (!acc[key]) {
          acc[key] = { tipo: f.tipo, count: 0 };
        }
        acc[key].count++;
        return acc;
      }, {});

      const topFavoritados = Object.entries(favoritosPorItem)
        .map(([key, data]) => ({
          itemId: key.split('-').slice(1).join('-'),
          tipo: data.tipo,
          totalSalvos: data.count,
        }))
        .sort((a, b) => b.totalSalvos - a.totalSalvos)
        .slice(0, 10);

      return {
        videos: {
          totalHoras: totalHoras.toFixed(1),
          totalVisualizacoes,
          totalCompletados,
          taxaConclusao,
          topVideos,
          distribuicaoTrilhas,
        },
        ferramentas: {
          totalAvaliacoes: totalAvaliacoesFerramentas,
          mediaGeral: mediaGeralFerramentas.toFixed(1),
          topFerramentas,
        },
        favoritos: {
          total: totalFavoritos,
          porTipo: favoritosPorTipo,
          topFavoritados,
        },
      };
    },
  });
}
