import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useTrilhasEmAndamento = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trilhas-em-andamento", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: trilhas } = await supabase
        .from("trilhas")
        .select("*")
        .eq("ativo", true)
        .eq("visivel_mentorados", true)
        .order("ordem");

      if (!trilhas) return [];

      const trilhasComProgresso = await Promise.all(
        trilhas.map(async (trilha) => {
          const { data: videos } = await supabase
            .from("videos")
            .select("id")
            .eq("trilha_id", trilha.id)
            .eq("ativo", true)
            .eq("visivel_mentorados", true);

          const totalVideos = videos?.length || 0;

          const { data: progresso } = await supabase
            .from("progresso_videos")
            .select("*, videos!inner(*)")
            .eq("user_id", user.id)
            .eq("completado", true)
            .eq("videos.trilha_id", trilha.id);

          const videosCompletos = progresso?.length || 0;
          const progressoPercent = totalVideos > 0 ? (videosCompletos / totalVideos) * 100 : 0;

          const { data: ultimaVisualizacao } = await supabase
            .from("progresso_videos")
            .select("ultima_visualizacao, videos!inner(titulo)")
            .eq("user_id", user.id)
            .eq("videos.trilha_id", trilha.id)
            .order("ultima_visualizacao", { ascending: false })
            .limit(1)
            .single();

          const { data: proximoVideo } = await supabase
            .from("videos")
            .select("id, titulo, ordem")
            .eq("trilha_id", trilha.id)
            .eq("ativo", true)
            .eq("visivel_mentorados", true)
            .not("id", "in", `(${progresso?.map(p => p.video_id).join(",") || "00000000-0000-0000-0000-000000000000"})`)
            .order("ordem")
            .limit(1)
            .single();

          return {
            ...trilha,
            totalVideos,
            videosCompletos,
            progressoPercent: Math.round(progressoPercent),
            ultimaVisualizacao: ultimaVisualizacao?.ultima_visualizacao,
            proximoVideo: proximoVideo?.titulo,
            proximoVideoId: proximoVideo?.id,
          };
        })
      );

      return trilhasComProgresso.filter(
        (t) => t.progressoPercent > 0 && t.progressoPercent < 100
      );
    },
    enabled: !!user?.id,
  });
};

export const useTrilhasConcluidas = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trilhas-concluidas", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: trilhas } = await supabase
        .from("trilhas")
        .select("*")
        .eq("ativo", true)
        .eq("visivel_mentorados", true)
        .order("ordem");

      if (!trilhas) return [];

      const trilhasComProgresso = await Promise.all(
        trilhas.map(async (trilha) => {
          const { data: videos } = await supabase
            .from("videos")
            .select("id")
            .eq("trilha_id", trilha.id)
            .eq("ativo", true)
            .eq("visivel_mentorados", true);

          const totalVideos = videos?.length || 0;

          const { data: progresso } = await supabase
            .from("progresso_videos")
            .select("*, videos!inner(*)")
            .eq("user_id", user.id)
            .eq("completado", true)
            .eq("videos.trilha_id", trilha.id);

          const videosCompletos = progresso?.length || 0;
          const progressoPercent = totalVideos > 0 ? (videosCompletos / totalVideos) * 100 : 0;

          const { data: certificado } = await supabase
            .from("certificados")
            .select("*")
            .eq("user_id", user.id)
            .eq("trilha_id", trilha.id)
            .single();

          const tempoTotal = progresso?.reduce((acc, p) => acc + (p.tempo_assistido || 0), 0) || 0;

          return {
            ...trilha,
            totalVideos,
            videosCompletos,
            progressoPercent: Math.round(progressoPercent),
            dataConclusao: certificado?.data_emissao,
            tempoTotal,
            certificadoId: certificado?.id,
          };
        })
      );

      return trilhasComProgresso.filter((t) => t.progressoPercent === 100);
    },
    enabled: !!user?.id,
  });
};

export const useTrilhasDisponiveis = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trilhas-disponiveis", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: trilhas } = await supabase
        .from("trilhas")
        .select("*")
        .eq("ativo", true)
        .eq("visivel_mentorados", true)
        .order("ordem");

      if (!trilhas) return [];

      const trilhasComProgresso = await Promise.all(
        trilhas.map(async (trilha) => {
          const { data: videos } = await supabase
            .from("videos")
            .select("id")
            .eq("trilha_id", trilha.id)
            .eq("ativo", true)
            .eq("visivel_mentorados", true);

          const totalVideos = videos?.length || 0;

          const { data: progresso } = await supabase
            .from("progresso_videos")
            .select("video_id")
            .eq("user_id", user.id)
            .eq("completado", true);

          const videosCompletosNaTrilha =
            videos?.filter((v) => progresso?.some((p) => p.video_id === v.id)).length || 0;

          const progressoPercent = totalVideos > 0 ? (videosCompletosNaTrilha / totalVideos) * 100 : 0;

          return {
            ...trilha,
            totalVideos,
            progressoPercent: Math.round(progressoPercent),
          };
        })
      );

      return trilhasComProgresso.filter((t) => t.progressoPercent === 0);
    },
    enabled: !!user?.id,
  });
};

export const useSequenciaEstudo = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sequencia-estudo", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data: progresso } = await supabase
        .from("progresso_videos")
        .select("ultima_visualizacao")
        .eq("user_id", user.id)
        .order("ultima_visualizacao", { ascending: false });

      if (!progresso || progresso.length === 0) return 0;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let sequencia = 0;
      let dataAtual = new Date(hoje);

      const datasUnicas = [...new Set(progresso.map(p => {
        const data = new Date(p.ultima_visualizacao);
        data.setHours(0, 0, 0, 0);
        return data.getTime();
      }))].sort((a, b) => b - a);

      for (const timestamp of datasUnicas) {
        const dataProgresso = new Date(timestamp);
        
        if (dataProgresso.getTime() === dataAtual.getTime()) {
          sequencia++;
          dataAtual.setDate(dataAtual.getDate() - 1);
        } else if (dataProgresso.getTime() < dataAtual.getTime()) {
          break;
        }
      }

      return sequencia;
    },
    enabled: !!user?.id,
  });
};

export const useProgressoGeral = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["progresso-geral", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: trilhas } = await supabase
        .from("trilhas")
        .select("id")
        .eq("ativo", true)
        .eq("visivel_mentorados", true);

      const totalTrilhas = trilhas?.length || 0;

      const { data: certificados } = await supabase
        .from("certificados")
        .select("id")
        .eq("user_id", user.id);

      const trilhasConcluidas = certificados?.length || 0;

      const { data: progresso } = await supabase
        .from("progresso_videos")
        .select("tempo_assistido")
        .eq("user_id", user.id);

      const tempoTotal = progresso?.reduce((acc, p) => acc + (p.tempo_assistido || 0), 0) || 0;

      return {
        totalTrilhas,
        trilhasConcluidas,
        percentualConclusao: totalTrilhas > 0 ? Math.round((trilhasConcluidas / totalTrilhas) * 100) : 0,
        tempoTotal,
        totalCertificados: trilhasConcluidas,
      };
    },
    enabled: !!user?.id,
  });
};
