import { useState, useCallback, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimpleVideoPlayerProps {
  videoId: string;
  endSeconds?: number;
  onEnded?: () => void;
  thumbnail?: string;
  title?: string;
  aspectRatio?: "video" | "reels" | "square";
  /** Quando true, oculta a thumbnail e inicia o player no mount (muted pra obedecer policy do browser). */
  autoplay?: boolean;
}

export function SimpleVideoPlayer({
  videoId,
  endSeconds,
  onEnded,
  thumbnail,
  title,
  aspectRatio = "video",
  autoplay = false,
}: SimpleVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [showThumbnail, setShowThumbnail] = useState(!autoplay);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const aspectClass = aspectRatio === "reels" 
    ? "aspect-[9/16]" 
    : aspectRatio === "square" 
    ? "aspect-square" 
    : "aspect-video";

  const handlePlay = () => {
    setShowThumbnail(false);
    setIsPlaying(true);
  };

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (endSeconds && video.currentTime >= endSeconds) {
      video.pause();
      setIsPlaying(false);
      if (onEnded) {
        onEnded();
      }
    }
  }, [endSeconds, onEnded]);

  const handleError = () => {
    setHasError(true);
  };

  const handlePlayerReady = useCallback(() => {
    // Player is ready
  }, []);

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Set up ref callback for the video element
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
  }, []);

  if (hasError) {
    return (
      <div className={cn("relative w-full bg-black overflow-hidden rounded-lg flex items-center justify-center", aspectClass)}>
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title || "Video thumbnail"}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 text-center space-y-4 p-6">
          <div className="text-destructive text-lg font-semibold">
            Erro ao carregar vídeo
          </div>
          <Button
            onClick={() => window.open(videoUrl, '_blank')}
            variant="outline"
            className="bg-background/10 hover:bg-background/20 text-foreground border-border"
          >
            Abrir no YouTube
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full bg-black overflow-hidden rounded-lg", aspectClass)}>
      {showThumbnail && thumbnail ? (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={thumbnail}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button
              size="lg"
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-transform"
            >
              <Play className="h-10 w-10 ml-1" fill="currentColor" />
            </Button>
          </div>
          <div className="absolute top-4 right-4 bg-black/80 px-3 py-1.5 rounded text-sm text-white font-medium">
            IA Aplicada
          </div>
        </div>
      ) : (
        <ReactPlayer
          src={videoUrl}
          playing={isPlaying}
          muted={autoplay}
          controls
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          ref={setVideoRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={onEnded}
          onError={handleError}
          onReady={handlePlayerReady}
          config={{
            youtube: {
              iv_load_policy: 3,
              rel: 0,
              start: 0,
            }
          }}
        />
      )}
    </div>
  );
}
