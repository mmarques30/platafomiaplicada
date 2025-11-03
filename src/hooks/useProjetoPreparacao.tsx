import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Buscar progresso dos vídeos
      const modulosArray = (projeto.modulos_obrigatorios as any[]) || [];
      const videoIds = modulosArray.flatMap((m: any) => m.video_ids) || [];
      
      if (videoIds.length === 0) {
        return {
          trilhas: projeto.trilhas_recomendadas || [],
          modulos: [],
          progressoGeral: 0
        };
      }
      
      const { data: progresso, error: progressoError } = await supabase
        .from("progresso_videos")
        .select("video_id, completado")
        .eq("user_id", userId)
        .in("video_id", videoIds);
      
      if (progressoError) throw progressoError;
      
      // Marcar módulos concluídos
      const modulosComProgresso = modulosArray.map((modulo: any) => ({
        ...modulo,
        videos_concluidos: modulo.video_ids.filter((vid: string) => 
          progresso?.some(p => p.video_id === vid && p.completado)
        ).length,
        total_videos: modulo.video_ids.length,
        concluido: modulo.video_ids.length > 0 && modulo.video_ids.every((vid: string) =>
          progresso?.some(p => p.video_id === vid && p.completado)
        )
      }));
      
      return {
        trilhas: (projeto.trilhas_recomendadas as any[]) || [],
        modulos: modulosComProgresso,
        progressoGeral: projeto.progresso_preparacao || 0
      };
    },
    enabled: !!projetoId && !!userId
  });
};
