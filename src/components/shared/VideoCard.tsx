import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, Play } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";

interface VideoCardProps {
  id: string;
  titulo: string;
  duracao?: number;
  youtube_id: string;
  thumbnail_customizado_url?: string;
}

export function VideoCard({ id, titulo, duracao, youtube_id, thumbnail_customizado_url }: VideoCardProps) {
  const thumbnailUrl = thumbnail_customizado_url || getYouTubeThumbnail(youtube_id);

  return (
    <Link to={`/videos/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-0">
            {/* Thumbnail */}
            <div className="w-full sm:w-48 flex-shrink-0">
              <AspectRatio ratio={16 / 9}>
                <div className="relative w-full h-full">
                  <img
                    src={thumbnailUrl}
                    alt={titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary-foreground ml-1" />
                    </div>
                  </div>
                </div>
              </AspectRatio>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-center">
              <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {titulo}
              </h3>
              {duracao && (
                <Badge variant="outline" className="w-fit">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.floor(duracao / 60)}min
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
