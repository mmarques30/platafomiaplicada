import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";
import { FavoriteButton } from "./FavoriteButton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";

interface VideoCardVerticalProps {
  id: string;
  titulo: string;
  youtube_id: string;
  thumbnail_customizado_url?: string;
  trilha_id: string;
  aspectRatio?: string;
}

export function VideoCardVertical({ 
  id, 
  titulo, 
  youtube_id, 
  thumbnail_customizado_url,
  trilha_id,
  aspectRatio = "9/16"
}: VideoCardVerticalProps) {
  const thumbnailUrl = getYouTubeThumbnail(youtube_id, thumbnail_customizado_url);
  const { logAccess } = useContentAccessLogger();

  const handleClick = () => {
    logAccess('video', id, titulo);
  };

  return (
    <Link 
      to={`/trilhas/${trilha_id}?video=${id}`} 
      className="block group"
      onClick={handleClick}
    >
      <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 relative w-full bg-muted aspect-square sm:aspect-[3/4] md:aspect-[9/16]">
        <img
          src={thumbnailUrl}
          alt={titulo}
          loading="lazy"
          className="block w-full h-full object-cover object-center"
        />
        
        {/* Botão de Favoritar */}
        <div className="absolute top-2 right-2">
          <FavoriteButton 
            tipo="video" 
            itemId={id} 
            variant="icon-only"
            size="md"
          />
        </div>
        
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
