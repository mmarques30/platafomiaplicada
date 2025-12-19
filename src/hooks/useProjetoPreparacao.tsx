import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrilhaRecomendada {
  trilha_id: string;
  titulo: string;
  prioridade: string;
  status: 'disponivel' | 'em_breve';
}

interface ModuloObrigatorio {
  modulo_id: string;
  titulo: string;
  trilha_id: string;
  trilha_titulo: string;
  status: 'disponivel' | 'em_breve';
  video_ids?: string[];
}

export const useProjetoPreparacao = (projetoId: string, userId: string) => {
  return useQuery({
    queryKey: ["projeto-preparacao", projetoId, userId],
    queryFn: async () => {
      if (!projetoId || !userId) return null;
      
      // Buscar projeto com trilhas/módulos
      const { data: projeto, error: projetoError } = await supabase
        .from("projetos_mentoria")
        .select("trilhas_recomendadas, modulos_obrigatorios, progresso_preparacao")
        .eq("id", projetoId)
        .single();
      
      if (projetoError) throw projetoError;
      if (!projeto) return null;
      
      const trilhasArray = (projeto.trilhas_recomendadas as unknown as TrilhaRecomendada[]) || [];
      const modulosArray = (projeto.modulos_obrigatorios as unknown as ModuloObrigatorio[]) || [];
      
      // Se não tem módulos, retornar apenas trilhas
      if (modulosArray.length === 0) {
        return {
          trilhas: trilhasArray,
          modulos: [],
          progressoGeral: 0
        };
      }
      
      // Coletar todos os video_ids disponíveis
      const videoIds = modulosArray
        .filter(m => m.status === 'disponivel' && m.video_ids && m.video_ids.length > 0)
        .flatMap((m) => m.video_ids || []);
      
      let progresso: any[] = [];
      
      if (videoIds.length > 0) {
        const { data: progressoData, error: progressoError } = await supabase
          .from("progresso_videos")
          .select("video_id, completado")
          .eq("user_id", userId)
          .in("video_id", videoIds);
        
        if (progressoError) throw progressoError;
        progresso = progressoData || [];
      }
      
      // Marcar módulos concluídos
      const modulosComProgresso = modulosArray.map((modulo) => {
        // Se módulo está em breve, não calcular progresso
        if (modulo.status === 'em_breve') {
          return {
            ...modulo,
            videos_concluidos: 0,
            total_videos: 0,
            concluido: false
          };
        }
        
        const videoIdsModulo = modulo.video_ids || [];
        return {
          ...modulo,
          videos_concluidos: videoIdsModulo.filter((vid: string) => 
            progresso.some(p => p.video_id === vid && p.completado)
          ).length,
          total_videos: videoIdsModulo.length,
          concluido: videoIdsModulo.length > 0 && videoIdsModulo.every((vid: string) =>
            progresso.some(p => p.video_id === vid && p.completado)
          )
        };
      });
      
      // Calcular progresso geral apenas dos módulos disponíveis
      const modulosDisponiveis = modulosComProgresso.filter(m => m.status === 'disponivel');
      const totalVideosDisponiveis = modulosDisponiveis.reduce((acc, m) => acc + (m.total_videos || 0), 0);
      const videosConcluidos = modulosDisponiveis.reduce((acc, m) => acc + (m.videos_concluidos || 0), 0);
      const progressoGeral = totalVideosDisponiveis > 0 
        ? Math.round((videosConcluidos / totalVideosDisponiveis) * 100) 
        : projeto.progresso_preparacao || 0;
      
      return {
        trilhas: trilhasArray,
        modulos: modulosComProgresso,
        progressoGeral
      };
    },
    enabled: !!projetoId && !!userId
  });
};
