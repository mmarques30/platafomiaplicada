import { useState } from "react";
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

function formatTotalDuration(totalMin: number) {
  if (!totalMin || totalMin <= 0) return "—";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// Thumbnail com placeholder enquanto carrega (evita o "demora a aparecer"/preto).
function VideoThumb({ src, alt, bloqueada }: { src: string; alt: string; bloqueada?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-brand-cream animate-pulse" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          bloqueada && "opacity-50 grayscale"
        )}
      />
    </>
  );
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

  const metrics = [
    { label: "Vídeos", value: String(totalVideos) },
    { label: "Progresso", value: `${progressPercent}%`, hint: `${completedVideos}/${totalVideos}` },
    { label: "Duração", value: formatTotalDuration(totalDuration) },
  ];

  return (
    <div className="space-y-5">
      {/* Header da Trilha */}
      <div className="space-y-3">
        <Badge className="bg-brand-strong/10 text-brand-strong border-brand-strong/20 hover:bg-brand-strong/10">
          {trilha.categoria}
        </Badge>
        <h1 className="font-serif-display text-3xl md:text-4xl tracking-tight text-foreground leading-tight">
          {trilha.titulo}
        </h1>
        {trilha.descricao && (
          <p className="text-muted-foreground max-w-2xl">{trilha.descricao}</p>
        )}

        {/* Métricas compactas — strip único brand em vez de 3 cards grandes */}
        <div className="inline-flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-brand-cream-soft border border-brand-hairline px-5 py-3">
          {metrics.map((m, i) => (
            <div key={m.label} className="flex items-center gap-6">
              {i > 0 && <span className="h-7 w-px bg-brand-hairline" />}
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">{m.label}</p>
                <p className="flex items-baseline gap-1.5">
                  <span className="font-serif-display text-xl text-foreground tabular-nums leading-none">{m.value}</span>
                  {m.hint && <span className="text-xs text-muted-foreground">{m.hint}</span>}
                </p>
              </div>
            </div>
          ))}
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
                  className="pl-4 basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <div
                    className={cn(
                      "group",
                      trilha.bloqueada ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                    onClick={() => !trilha.bloqueada && onSelectVideo(video.id)}
                  >
                    <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-brand-hairline shadow-sm hover:shadow-lg transition-all duration-300 bg-brand-cream">
                      <VideoThumb
                        src={getYouTubeThumbnail(video.youtube_id, video.thumbnail_customizado_url || video.thumbnail_url)}
                        alt={video.titulo}
                        bloqueada={trilha.bloqueada}
                      />

                      {/* Overlay "Em Breve" para trilhas bloqueadas */}
                      {trilha.bloqueada ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="bg-brand-cream-soft/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-2xl flex items-center gap-1.5">
                            <Clock className="h-5 w-5 text-foreground" strokeWidth={2} />
                            <span className="text-foreground font-medium text-sm">Em Breve</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Overlay com Play */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-brand-strong/90 flex items-center justify-center">
                              <Play className="h-5 w-5 text-brand-cream ml-0.5" fill="currentColor" />
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
                            <div className="absolute top-2 left-2 bg-brand-strong text-brand-cream rounded-full p-1">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                        </>
                      )}

                      {/* Badges de Número e Módulo */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className="bg-brand-strong text-brand-cream text-xs border-transparent">
                          {idx + 1}
                        </Badge>
                        {!isCompleted && (
                          <Badge variant="secondary" className="text-xs max-w-[120px] truncate bg-brand-cream-soft text-foreground border-brand-hairline">
                            {video.modulo.titulo}
                          </Badge>
                        )}
                      </div>

                      {/* Título Sobreposto */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
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

          {/* Setas de Navegação */}
          {videos.length > 5 && (
            <>
              <CarouselPrevious className="absolute -left-10 top-1/2 -translate-y-1/2 bg-brand-cream-soft hover:bg-brand-strong hover:text-brand-cream border-brand-hairline shadow-lg" />
              <CarouselNext className="absolute -right-10 top-1/2 -translate-y-1/2 bg-brand-cream-soft hover:bg-brand-strong hover:text-brand-cream border-brand-hairline shadow-lg" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
}
