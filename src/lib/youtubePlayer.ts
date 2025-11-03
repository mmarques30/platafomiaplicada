// YouTube IFrame API Helper
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiReady = false;
let apiLoadPromise: Promise<void> | null = null;

export function loadYouTubeAPI(): Promise<void> {
  if (apiReady) {
    return Promise.resolve();
  }

  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise((resolve) => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      apiReady = true;
      resolve();
      return;
    }

    // Load the IFrame Player API code asynchronously
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // API will call this function when ready
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      resolve();
    };
  });

  return apiLoadPromise;
}

export interface YouTubePlayerOptions {
  videoId: string;
  onReady?: (player: any) => void;
  onStateChange?: (event: any) => void;
  onTimeUpdate?: (currentTime: number) => void;
  startSeconds?: number;
}

export class CustomYouTubePlayer {
  private player: any = null;
  private containerId: string;
  private options: YouTubePlayerOptions;
  private progressInterval: NodeJS.Timeout | null = null;

  constructor(containerId: string, options: YouTubePlayerOptions) {
    this.containerId = containerId;
    this.options = options;
  }

  async initialize() {
    await loadYouTubeAPI();

    this.player = new window.YT.Player(this.containerId, {
      videoId: this.options.videoId,
      playerVars: {
        autoplay: 0,
        controls: 0, // Remove controles padrão
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 1,
        playsinline: 1,
        iv_load_policy: 3,
        color: 'white',
        cc_load_policy: 0,
        disablekb: 0,
        enablejsapi: 1,
        origin: window.location.origin,
        start: this.options.startSeconds || 0,
      },
      events: {
        onReady: (event: any) => {
          if (this.options.onReady) {
            this.options.onReady(this.player);
          }
        },
        onStateChange: (event: any) => {
          if (this.options.onStateChange) {
            this.options.onStateChange(event);
          }
          
          // Start progress tracking when playing
          if (event.data === window.YT.PlayerState.PLAYING) {
            this.startProgressTracking();
          } else {
            this.stopProgressTracking();
          }
        },
      },
    });

    return this.player;
  }

  private startProgressTracking() {
    if (this.progressInterval) return;

    this.progressInterval = setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        const currentTime = this.player.getCurrentTime();
        if (this.options.onTimeUpdate) {
          this.options.onTimeUpdate(currentTime);
        }
      }
    }, 1000);
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  play() {
    this.player?.playVideo();
  }

  pause() {
    this.player?.pauseVideo();
  }

  seekTo(seconds: number) {
    this.player?.seekTo(seconds, true);
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() || 0;
  }

  getDuration(): number {
    return this.player?.getDuration() || 0;
  }

  getPlayerState(): number {
    return this.player?.getPlayerState() || -1;
  }

  setVolume(volume: number) {
    this.player?.setVolume(volume);
  }

  getVolume(): number {
    return this.player?.getVolume() || 100;
  }

  destroy() {
    this.stopProgressTracking();
    this.player?.destroy();
  }
}

export const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};
