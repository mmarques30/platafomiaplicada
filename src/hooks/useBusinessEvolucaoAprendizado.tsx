import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AtividadeItem {
  id: string;
  tipo: "video" | "prompt" | "acesso";
  descricao: string;
  data: string;
  itemId: string;
  tipoConteudo?: string;
}

export interface EvolucaoAprendizadoData {
  videos: {
    total: number;
    tempoTotalMinutos: number;
    percentualConcluido: number;
    ultimoAcesso: string | null;
  };
  prompts: {
    total: number;
  };
  interacoes: {
    totalAcessos: number;
    totalCliques: number;
  };
  atividades: AtividadeItem[];
  favoritos: string[];
}

export function useBusinessEvolucaoAprendizado() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["business-evolucao-aprendizado", user?.id],
    queryFn: async (): Promise<EvolucaoAprendizadoData> => {
      if (!user?.id) {
        return {
          videos: { total: 0, tempoTotalMinutos: 0, percentualConcluido: 0, ultimoAcesso: null },
          prompts: { total: 0 },
          interacoes: { totalAcessos: 0, totalCliques: 0 },
          atividades: [],
          favoritos: []
        };
      }

      // Buscar dados em paralelo
      const [videosResult, promptsResult, acessosResult, cliquesResult, favoritosResult] = await Promise.all([
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
          .order("copied_at", { ascending: false }),
        
        // Acessos a conteúdos
        supabase
          .from("content_access_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("accessed_at", { ascending: false }),
        
        // Cliques em botões
        supabase
          .from("button_click_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("clicked_at", { ascending: false }),
        
        // Favoritos do usuário
        supabase
          .from("favoritos")
          .select("item_id")
          .eq("user_id", user.id)
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

      // Processar interações
      const acessos = acessosResult.data || [];
      const cliques = cliquesResult.data || [];

      // Processar favoritos
      const favoritos = (favoritosResult.data || []).map(f => f.item_id);

      // Combinar TODAS as atividades
      const atividadesVideos: AtividadeItem[] = videos.map(v => ({
        id: v.id,
        tipo: "video" as const,
        descricao: (v.videos as any)?.titulo || 'Vídeo',
        data: v.updated_at,
        itemId: v.video_id,
        tipoConteudo: "Vídeo"
      }));

      const atividadesPrompts: AtividadeItem[] = prompts.map(p => ({
        id: p.id,
        tipo: "prompt" as const,
        descricao: p.prompt_titulo || 'Prompt',
        data: p.copied_at,
        itemId: p.prompt_id || p.id,
        tipoConteudo: "Prompt"
      }));

      const atividadesAcessos: AtividadeItem[] = acessos.map(a => ({
        id: a.id,
        tipo: "acesso" as const,
        descricao: a.content_title || a.content_type,
        data: a.accessed_at,
        itemId: a.content_id,
        tipoConteudo: a.content_type
      }));

      // Ordenar por data (mais recente primeiro)
      const atividades = [...atividadesVideos, ...atividadesPrompts, ...atividadesAcessos]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      return {
        videos: {
          total: totalVideos,
          tempoTotalMinutos,
          percentualConcluido,
          ultimoAcesso
        },
        prompts: {
          total: prompts.length
        },
        interacoes: {
          totalAcessos: acessos.length,
          totalCliques: cliques.length
        },
        atividades,
        favoritos
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}
