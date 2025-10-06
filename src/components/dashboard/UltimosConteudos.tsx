import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoCard } from "@/components/shared/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";

export function UltimosConteudos() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["ultimos-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-video rounded-lg" />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Nenhum vídeo disponível ainda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          titulo={video.titulo}
          youtube_id={video.youtube_id}
          thumbnail_customizado_url={video.thumbnail_customizado_url}
        />
      ))}
    </div>
  );
}
