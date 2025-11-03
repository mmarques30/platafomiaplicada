import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface TrilhaCardProps {
  id: string;
  titulo: string;
  imagem_url?: string;
  visivel_apenas_pro?: boolean;
}

export function TrilhaCard({ id, titulo, imagem_url, visivel_apenas_pro }: TrilhaCardProps) {
  return (
    <Link to={`/trilhas/${id}`} className="block group">
      <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 relative h-[400px] w-full bg-muted">
        {visivel_apenas_pro && (
          <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            🔒 PRO
          </div>
        )}
        <img
          src={imagem_url || "/placeholder.svg"}
          alt={titulo}
          loading="lazy"
          className="block w-full h-full object-cover object-center"
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
