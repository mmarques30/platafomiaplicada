export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function getYouTubeThumbnail(videoId: string, customThumbnail?: string | null): string {
  if (customThumbnail && customThumbnail.trim() !== '') {
    return customThumbnail;
  }
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function getYouTubeDuration(videoId: string): Promise<number | null> {
  // Esta função poderia usar a API do YouTube para obter a duração
  // Por enquanto, retorna null (duração manual)
  return Promise.resolve(null);
}
