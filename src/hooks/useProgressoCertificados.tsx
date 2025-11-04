import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useProgressoCertificados = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["progresso-certificados", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: trilhas } = await supabase
        .from("trilhas")
        .select(`
          id,
          titulo,
          videos(id)
        `)
        .eq("ativo", true)
        .eq("visivel_mentorados", true);
      
      if (!trilhas) return [];
      
      const progressoTrilhas = await Promise.all(
        trilhas.map(async (trilha) => {
          const videoIds = trilha.videos?.map((v: any) => v.id) || [];
          
          if (videoIds.length === 0) {
            return {
              trilhaId: trilha.id,
              titulo: trilha.titulo,
              percentual: 0,
              faltamVideos: 0,
              totalVideos: 0,
            };
          }
          
          const { data: videosCompletos } = await supabase
            .from("progresso_videos")
            .select("video_id")
            .eq("user_id", user.id)
            .eq("completado", true)
            .in("video_id", videoIds);
          
          const totalVideos = videoIds.length;
          const completedCount = videosCompletos?.length || 0;
          const percentual = totalVideos > 0 ? (completedCount / totalVideos) * 100 : 0;
          
          return {
            trilhaId: trilha.id,
            titulo: trilha.titulo,
            percentual: Math.round(percentual),
            faltamVideos: totalVideos - completedCount,
            totalVideos,
          };
        })
      );
      
      return progressoTrilhas
        .filter(p => p.percentual > 0 && p.percentual < 100)
        .sort((a, b) => b.percentual - a.percentual);
    },
    enabled: !!user?.id
  });
};
