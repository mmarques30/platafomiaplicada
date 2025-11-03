import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipForward } from "lucide-react";
import { CustomYouTubePlayer, PlayerState } from "@/lib/youtubePlayer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CustomVideoPlayerProps {
  videoId: string;
  startSeconds?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  thumbnail?: string;
  title?: string;
}

export function CustomVideoPlayer({
  videoId,
  startSeconds = 0,
  onTimeUpdate,
  onEnded,
  thumbnail,
  title,
}: CustomVideoPlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  
  const playerRef = useRef<CustomYouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const playerId = `youtube-player-${videoId}`;
    
    if (!playerRef.current) {
      const player = new CustomYouTubePlayer(playerId, {
        videoId,
        startSeconds,
        onReady: (p) => {
          setPlayerReady(true);
          setDuration(p.getDuration());
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
          if (onTimeUpdate) {
            onTimeUpdate(time);
          }
        },
      });

      player.initialize();
      playerRef.current = player;
    }

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [videoId, startSeconds, onTimeUpdate, onEnded]);

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

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden group rounded-lg"
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
