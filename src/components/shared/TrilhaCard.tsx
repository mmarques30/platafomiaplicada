import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface TrilhaCardProps {
  id: string;
  titulo: string;
  imagem_url?: string;
}

export function TrilhaCard({ id, titulo, imagem_url }: TrilhaCardProps) {
  return (
    <Link to={`/trilhas/${id}`} className="block group">
      <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 relative h-[320px] w-full bg-muted">
        <img
          src={imagem_url || "/placeholder.svg"}
          alt={titulo}
          loading="lazy"
          className="block w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
            <ChevronRight className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </div>
    </Link>
  );
}
