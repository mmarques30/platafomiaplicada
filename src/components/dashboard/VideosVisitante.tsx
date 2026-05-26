import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoCardVertical } from "@/components/shared/VideoCardVertical";
import { Skeleton } from "@/components/ui/skeleton";

export function VideosVisitante() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos-visitantes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          id,
          titulo,
          thumbnail_customizado_url,
          youtube_id,
          trilha_id
        `)
        .eq("ativo", true)
        .eq("visivel_visitantes", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhum vídeo disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-3">
      {videos.map((video) => (
        <VideoCardVertical
          key={video.id}
          id={video.id}
          titulo={video.titulo}
          youtube_id={video.youtube_id}
          thumbnail_customizado_url={video.thumbnail_customizado_url}
          trilha_id={video.trilha_id}
        />
      ))}
    </div>
  );
}
