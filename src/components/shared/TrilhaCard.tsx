import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Lock } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";

interface TrilhaCardProps {
  id: string;
  titulo: string;
  imagem_url?: string;
  visivel_apenas_pro?: boolean;
}

export function TrilhaCard({ id, titulo, imagem_url, visivel_apenas_pro }: TrilhaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link to={`/trilhas/${id}`} className="block group">
      <div className="overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 relative w-full aspect-[9/16] max-h-[55vh] md:max-h-none bg-muted border-2 border-primary/10 hover:border-primary/30">
        {visivel_apenas_pro && (
          <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
            <Lock className="h-4 w-4" /> PRO
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton 
            tipo="trilha" 
            itemId={id}
            variant="icon-only"
            size="md"
          />
        </div>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={imagem_url || "/placeholder.svg"}
          alt={titulo}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "block w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <ChevronRight className="h-6 w-6 text-primary-foreground" strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
}
