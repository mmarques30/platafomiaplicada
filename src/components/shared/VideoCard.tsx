import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play } from "lucide-react";
import { CapaVideo } from "@/components/shared/CapaVideo";

interface VideoCardProps {
  id: string;
  titulo: string;
  youtube_id: string;
  thumbnail_customizado_url?: string;
  trilha_id: string;
}

export function VideoCard({ id, titulo, youtube_id, thumbnail_customizado_url, trilha_id }: VideoCardProps) {
  return (
    <Link to={`/trilhas/${trilha_id}?video=${id}`} className="block group">
      <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
        <AspectRatio ratio={16 / 9}>
          <div className="relative w-full h-full">
            <CapaVideo youtubeId={youtube_id} capa={thumbnail_customizado_url} alt={titulo} />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        </AspectRatio>
      </div>
    </Link>
  );
}
