import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrilhaCarousel } from "./TrilhaCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useMemo } from "react";

export function UltimosConteudos() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["ultimos-videos-por-trilha"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          trilha:trilhas!videos_trilha_id_fkey(id, titulo, imagem_url)
        `)
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  // Agrupar vídeos por trilha
  const trilhasComVideos = useMemo(() => {
    if (!videos) return [];

    const grouped = videos.reduce((acc, video) => {
      const trilhaId = video.trilha_id;
      if (!trilhaId) return acc; // Pular vídeos sem trilha
      
      if (!acc[trilhaId]) {
        acc[trilhaId] = {
          trilhaId,
          trilhaTitulo: video.trilha?.titulo || "Sem trilha",
          videos: [],
          dataRecente: video.created_at
        };
      }
      acc[trilhaId].videos.push(video);
      return acc;
    }, {} as Record<string, any>);

    // Retornar apenas as 3 trilhas mais recentes
    return Object.values(grouped)
      .sort((a: any, b: any) => new Date(b.dataRecente).getTime() - new Date(a.dataRecente).getTime())
      .slice(0, 3);
  }, [videos]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-4">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-[400px] flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!trilhasComVideos || trilhasComVideos.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nenhum conteúdo disponível ainda. Novos vídeos aparecerão aqui organizados por trilha.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-12">
      {trilhasComVideos.map((trilha: any) => (
        <TrilhaCarousel
          key={trilha.trilhaId}
          trilhaId={trilha.trilhaId}
          trilhaTitulo={trilha.trilhaTitulo}
          videos={trilha.videos}
        />
      ))}
    </div>
  );
}
