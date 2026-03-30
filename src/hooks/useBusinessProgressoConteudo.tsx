import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";

export interface ProgressoConteudoData {
  videos: {
    total: number;
    tempoTotalMinutos: number;
    percentualConcluido: number;
    ultimoAcesso: string | null;
  };
  prompts: {
    total: number;
    ultimos: Array<{
      titulo: string;
      copiadoEm: string;
    }>;
  };
  interacoes: {
    totalAcessos: number;
    totalCliques: number;
    atividadeRecente: Array<{
      tipo: string;
      descricao: string;
      data: string;
    }>;
  };
}

export function useBusinessProgressoConteudo() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["business-progresso-conteudo", user?.id],
    queryFn: async (): Promise<ProgressoConteudoData> => {
      if (!user?.id) {
        return {
          videos: { total: 0, tempoTotalMinutos: 0, percentualConcluido: 0, ultimoAcesso: null },
          prompts: { total: 0, ultimos: [] },
          interacoes: { totalAcessos: 0, totalCliques: 0, atividadeRecente: [] }
        };
      }

      // Buscar dados em paralelo
      const [videosResult, promptsResult, acessosResult, cliquesResult] = await Promise.all([
        // Videos assistidos
        supabase
          .from("progresso_videos")
          .select("*, videos(titulo)")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        
        // Prompts copiados
        supabase
          .from("prompt_copy_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("copied_at", { ascending: false })
          .limit(5),
        
        // Acessos a conteúdos
        supabase
          .from("content_access_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("accessed_at", { ascending: false })
          .limit(10),
        
        // Cliques em botões
        supabase
          .from("button_click_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("clicked_at", { ascending: false })
          .limit(10),
      ]);

      // Processar videos
      const videos = videosResult.data || [];
      const totalVideos = videos.length;
      const tempoTotalMinutos = videos.reduce((acc, v) => acc + (v.tempo_assistido || 0), 0);
      const videosCompletados = videos.filter(v => v.completado).length;
      const percentualConcluido = totalVideos > 0 ? Math.round((videosCompletados / totalVideos) * 100) : 0;
      const ultimoAcesso = videos.length > 0 ? videos[0].updated_at : null;

      // Processar prompts
      const prompts = promptsResult.data || [];
      const ultimosPrompts = prompts.map(p => ({
        titulo: p.prompt_titulo || "Prompt",
        copiadoEm: p.copied_at
      }));

      // Processar interações
      const acessos = acessosResult.data || [];
      const cliques = cliquesResult.data || [];

      // Combinar atividades recentes
      const atividadesVideos = videos.slice(0, 3).map(v => ({
        tipo: "video",
        descricao: `Assistiu "${(v.videos as any)?.titulo || 'Vídeo'}"`,
        data: v.updated_at
      }));

      const atividadesPrompts = prompts.slice(0, 3).map(p => ({
        tipo: "prompt",
        descricao: `Copiou prompt "${p.prompt_titulo || 'Prompt'}"`,
        data: p.copied_at
      }));

      const atividadesAcessos = acessos.slice(0, 3).map(a => ({
        tipo: "acesso",
        descricao: `Acessou "${a.content_title || a.content_type}"`,
        data: a.accessed_at
      }));

      // Ordenar por data
      const atividadeRecente = [...atividadesVideos, ...atividadesPrompts, ...atividadesAcessos]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 5);

      return {
        videos: {
          total: totalVideos,
          tempoTotalMinutos,
          percentualConcluido,
          ultimoAcesso
        },
        prompts: {
          total: prompts.length,
          ultimos: ultimosPrompts
        },
        interacoes: {
          totalAcessos: acessos.length,
          totalCliques: cliques.length,
          atividadeRecente
        }
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
