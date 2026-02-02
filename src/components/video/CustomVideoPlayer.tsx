import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipForward, HardDrive, ExternalLink } from "lucide-react";
import { CustomYouTubePlayer, PlayerState } from "@/lib/youtubePlayer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CustomVideoPlayerProps {
  videoId: string;
  googleDriveUrl?: string | null;
  startSeconds?: number;
  endSeconds?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  thumbnail?: string;
  title?: string;
  aspectRatio?: "video" | "reels" | "square";
}

export function CustomVideoPlayer({
  videoId,
  googleDriveUrl,
  startSeconds = 0,
  endSeconds,
  onTimeUpdate,
  onEnded,
  thumbnail,
  title,
  aspectRatio = "video",
}: CustomVideoPlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const playerRef = useRef<CustomYouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const initializePlayer = () => {
    const playerId = `youtube-player-${videoId}`;
    
    if (playerRef.current) return;
    
    const player = new CustomYouTubePlayer(playerId, {
      videoId,
      startSeconds,
      onReady: (p) => {
        setPlayerReady(true);
        setIsLoading(false);
        setError(null);
        setDuration(p.getDuration());
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        retryCountRef.current = 0;
      },
      onStateChange: (event) => {
        const state = event.data;
        setIsPlaying(state === PlayerState.PLAYING);
        
        if (state === PlayerState.ENDED && onEnded) {
          onEnded();
        }
        
        if (state === PlayerState.PLAYING) {
          setDuration(playerRef.current?.getDuration() || 0);
        }
      },
      onTimeUpdate: (time) => {
        setCurrentTime(time);
        // Parar no tempo limite se definido
        if (endSeconds && time >= endSeconds) {
          playerRef.current?.pause();
          if (onEnded) {
            onEnded();
          }
        }
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
      },
    });

    player.initialize().catch(() => {
      // Retry on failure
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        playerRef.current = null;
        setTimeout(initializePlayer, 2000);
      } else {
        setError("Falha ao carregar o vídeo");
        setIsLoading(false);
      }
    });
    
    playerRef.current = player;
  };

  useEffect(() => {
    // Validar YouTube ID
    if (!videoId || videoId.length < 10) {
      setError("ID de vídeo inválido");
      setIsLoading(false);
      return;
    }

    // Timeout de 20 segundos para detectar falhas
    loadingTimeoutRef.current = setTimeout(() => {
      if (!playerReady && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        playerRef.current = null;
        initializePlayer();
      } else if (!playerReady) {
        setError("Tempo esgotado ao carregar o vídeo. Clique para abrir no YouTube.");
        setIsLoading(false);
      }
    }, 20000);
    
    initializePlayer();

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [videoId, startSeconds]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    
    if (showThumbnail) {
      setShowThumbnail(false);
      setTimeout(() => {
        playerRef.current?.play();
      }, 100);
    } else if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    playerRef.current?.seekTo(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    playerRef.current?.setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(100);
      playerRef.current?.setVolume(100);
    } else {
      setIsMuted(true);
      setVolume(0);
      playerRef.current?.setVolume(0);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    playerRef.current?.seekTo(newTime);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    
    if (isPlaying && !showThumbnail) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const aspectClass = aspectRatio === "reels" ? "aspect-[9/16]" : aspectRatio === "square" ? "aspect-square" : "aspect-video";

  // Render de erro
  if (error) {
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
          <div className="text-red-500 text-lg font-semibold">
            Erro ao carregar vídeo
          </div>
          <p className="text-white/80 text-sm">{error}</p>
          <div className="flex flex-col gap-2">
            {googleDriveUrl && (
              <Button
                onClick={() => window.open(googleDriveUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Assistir no Google Drive
              </Button>
            )}
            <Button
              onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no YouTube
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render de loading
  if (isLoading) {
    return (
      <div className={cn("relative w-full bg-black overflow-hidden rounded-lg flex items-center justify-center", aspectClass)}>
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title || "Video thumbnail"}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80 text-sm">Carregando vídeo...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full bg-black overflow-hidden group rounded-lg", aspectClass)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showThumbnail && setShowControls(false)}
    >
      {/* YouTube Player (hidden behind thumbnail initially) */}
      <div
        id={`youtube-player-${videoId}`}
        className={cn(
          "absolute inset-0 w-full h-full",
          showThumbnail && "invisible"
        )}
      />

      {/* Custom Thumbnail Overlay */}
      {showThumbnail && thumbnail && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={thumbnail}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button
              size="lg"
              onClick={handlePlayPause}
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-transform"
            >
              <Play className="h-10 w-10 ml-1" fill="currentColor" />
            </Button>
          </div>
          <div className="absolute top-4 right-4 bg-black/80 px-3 py-1.5 rounded text-sm text-white font-medium">
            IA Aplicada
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      {!showThumbnail && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Gradient overlay for controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Top branding */}
          <div className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded text-xs text-white font-medium z-10">
            IA Aplicada
          </div>

          {/* Center play/pause on click */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              variant="ghost"
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" fill="white" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" fill="white" />
              )}
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 z-10">
            {/* Progress bar */}
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />

            {/* Control buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePlayPause}
                  className="hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSkip(-10)}
                  className="hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSkip(10)}
                  className="hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMuteToggle}
                    className="hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                <span className="text-sm ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
