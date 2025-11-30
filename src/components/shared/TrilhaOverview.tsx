import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Play } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { cn } from "@/lib/utils";

interface Video {
  id: string;
  titulo: string;
  descricao?: string;
  duracao?: number;
  youtube_id: string;
  thumbnail_url?: string;
  modulo: {
    id: string;
    titulo: string;
  };
}

interface TrilhaOverviewProps {
  trilha: {
    titulo: string;
    descricao?: string;
    categoria: string;
  };
  videos: Video[];
  onSelectVideo: (videoId: string) => void;
  progressData?: Array<{ video_id: string; completado?: boolean }>;
}

export function TrilhaOverview({ trilha, videos, onSelectVideo, progressData }: TrilhaOverviewProps) {
  const totalVideos = videos.length;
  const completedVideos = videos.filter(v => 
    progressData?.find(p => p.video_id === v.id)?.completado
  ).length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const totalDuration = videos.reduce((sum, v) => sum + (v.duracao || 0), 0);

  const getVideoProgress = (videoId: string) => {
    return progressData?.find(p => p.video_id === videoId);
  };

  // Agrupar vídeos por módulo
  const videosByModule = videos.reduce((acc, video) => {
    const moduloId = video.modulo.id;
    if (!acc[moduloId]) {
      acc[moduloId] = {
        modulo: video.modulo,
        videos: []
      };
    }
    acc[moduloId].videos.push(video);
    return acc;
  }, {} as Record<string, { modulo: { id: string; titulo: string }; videos: Video[] }>);

  return (
    <div className="space-y-6">
      {/* Header da Trilha */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="mb-2">{trilha.categoria}</Badge>
          <h1 className="text-3xl font-bold">{trilha.titulo}</h1>
          {trilha.descricao && (
            <p className="text-muted-foreground text-lg">{trilha.descricao}</p>
          )}
        </div>

        {/* Métricas */}
        <div className="flex flex-wrap gap-4">
          <Card className="flex-1 min-w-[200px]">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total de Vídeos</div>
              <div className="text-2xl font-bold">{totalVideos}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Progresso</div>
              <div className="text-2xl font-bold">{progressPercent}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {completedVideos}/{totalVideos} concluídos
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Duração Total</div>
              <div className="text-2xl font-bold">{Math.round(totalDuration / 60)}h</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de Vídeos por Módulo */}
      <div className="space-y-8">
        {Object.values(videosByModule).map((group, idx) => (
          <div key={group.modulo.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{idx + 1}</Badge>
              <h2 className="text-xl font-semibold">{group.modulo.titulo}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.videos.map((video) => {
                const progress = getVideoProgress(video.id);
                const isCompleted = progress?.completado;

                return (
                  <Card
                    key={video.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
                      isCompleted && "border-green-600"
                    )}
                    onClick={() => onSelectVideo(video.id)}
                  >
                    <div className="relative">
                      <img
                        src={getYouTubeThumbnail(video.youtube_id, video.thumbnail_url)}
                        alt={video.titulo}
                        className="w-full aspect-video object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      {isCompleted && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                        {video.titulo}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{video.duracao ? `${video.duracao} min` : "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
