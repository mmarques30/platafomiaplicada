import { useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { CapaVideo } from "@/components/shared/CapaVideo";
import { FavoriteButton } from "./FavoriteButton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";
import { cn } from "@/lib/utils";

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
  trilha_id,
}: VideoCardVerticalProps) {
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
      <div className="overflow-hidden rounded-xl border border-brand-hairline shadow-sm hover:shadow-lg transition-all duration-300 relative w-full bg-brand-cream aspect-[9/16]">
        <CapaVideo
          youtubeId={youtube_id}
          capa={thumbnail_customizado_url}
          alt={titulo}
          className="block object-center"
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
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Título do vídeo */}
      <p className="mt-2 text-sm font-medium text-foreground line-clamp-2 px-0.5">
        {titulo}
      </p>
    </Link>
  );
}
