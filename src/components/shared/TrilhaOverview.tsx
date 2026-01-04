import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Play } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Video {
  id: string;
  titulo: string;
  descricao?: string;
  duracao?: number;
  youtube_id: string;
  thumbnail_url?: string;
  thumbnail_customizado_url?: string;
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
    bloqueada?: boolean;
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

      {/* Lista de Vídeos em Carrossel Único */}
      <div className="relative px-12">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {videos.map((video, idx) => {
              const progress = getVideoProgress(video.id);
              const isCompleted = progress?.completado;

              return (
                <CarouselItem 
                  key={video.id} 
                  className="pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div
                    className={cn(
                      "group",
                      trilha.bloqueada ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                    onClick={() => !trilha.bloqueada && onSelectVideo(video.id)}
                  >
                    <div className="relative aspect-[4/3] sm:aspect-square md:aspect-[9/16] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                      <img
                        src={getYouTubeThumbnail(video.youtube_id, video.thumbnail_customizado_url || video.thumbnail_url)}
                        alt={video.titulo}
                        className={cn(
                          "w-full h-full object-cover",
                          trilha.bloqueada && "opacity-50 grayscale"
                        )}
                      />
                      
                      {/* Overlay "Em Breve" para trilhas bloqueadas */}
                      {trilha.bloqueada ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="bg-muted/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-2xl flex items-center gap-1.5">
                            <Clock className="h-5 w-5 text-foreground" strokeWidth={2} />
                            <span className="text-foreground font-medium text-sm">Em Breve</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Overlay com Play (apenas para trilhas desbloqueadas) */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                              <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                            </div>
                          </div>

                          {/* Botão de Favoritar */}
                          <div className="absolute top-2 right-2">
                            <FavoriteButton 
                              tipo="video" 
                              itemId={video.id} 
                              variant="icon-only"
                              size="md"
                            />
                          </div>

                          {/* Badge de Concluído */}
                          {isCompleted && (
                            <div className="absolute top-2 left-2 bg-green-600 text-white rounded-full p-1">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                        </>
                      )}

                      {/* Badges de Número e Módulo */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          {idx + 1}
                        </Badge>
                        {!isCompleted && (
                          <Badge variant="secondary" className="text-xs max-w-[120px] truncate">
                            {video.modulo.titulo}
                          </Badge>
                        )}
                      </div>

                      {/* Título Sobreposto */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="font-semibold text-sm text-white line-clamp-2 mb-1">
                          {video.titulo}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <Clock className="h-3 w-3" />
                          <span>{video.duracao ? `${video.duracao} min` : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {/* Setas de Navegação - visíveis apenas se houver mais de 4 vídeos */}
          {videos.length > 4 && (
            <>
              <CarouselPrevious className="absolute -left-10 top-1/2 -translate-y-1/2 bg-card hover:bg-primary hover:text-primary-foreground border-border shadow-lg" />
              <CarouselNext className="absolute -right-10 top-1/2 -translate-y-1/2 bg-card hover:bg-primary hover:text-primary-foreground border-border shadow-lg" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
}
