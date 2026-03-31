import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuloCardProps {
  trilhaId: string;
  moduloId: string;
  titulo: string;
  descricao?: string;
  imagem_url?: string;
  visivel_apenas_pro?: boolean;
}

export function ModuloCard({ 
  trilhaId, 
  moduloId,
  titulo, 
  descricao,
  imagem_url,
  visivel_apenas_pro
}: ModuloCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link 
      to={`/trilhas/${trilhaId}?modulo=${moduloId}`} 
      className="block group"
    >
      <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 relative h-[400px] w-full bg-muted">
        {visivel_apenas_pro && (
          <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            🔒 PRO
          </div>
        )}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={imagem_url || "/placeholder.svg"}
          alt={titulo}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "block w-full h-full object-cover object-center transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Overlay com título e descrição */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
            {titulo}
          </h3>
          {descricao && (
            <p className="text-white/90 text-sm line-clamp-2">
              {descricao}
            </p>
          )}
        </div>
        
        {/* Ícone de navegação */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </Link>
  );
}
