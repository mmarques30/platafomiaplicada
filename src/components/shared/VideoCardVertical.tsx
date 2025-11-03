import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";

interface VideoCardVerticalProps {
  id: string;
  titulo: string;
  youtube_id: string;
  thumbnail_customizado_url?: string;
  trilha_id: string;
}

export function VideoCardVertical({ 
  id, 
  titulo, 
  youtube_id, 
  thumbnail_customizado_url,
  trilha_id
}: VideoCardVerticalProps) {
  const thumbnailUrl = getYouTubeThumbnail(youtube_id, thumbnail_customizado_url);

  return (
    <Link to={`/trilhas/${trilha_id}?video=${id}`} className="block group">
      <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 relative h-[400px] w-full bg-muted">
        <img
          src={thumbnailUrl}
          alt={titulo}
          loading="lazy"
          className="block w-full h-full object-cover object-center"
        />
        
        {/* Overlay com Play */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      </div>
    </Link>
  );
}
