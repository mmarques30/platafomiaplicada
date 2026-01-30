import { Link } from "react-router-dom";
import { ChevronRight, Lock, Clock } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";

interface TrilhaCardBloqueavelProps {
  id: string;
  titulo: string;
  imagem_url?: string;
  bloqueada: boolean;
  visivel_apenas_pro?: boolean;
  nivel_minimo_acesso?: string;
  isVisitante?: boolean;
  temConteudoDisponivel?: boolean;
  aspectRatio?: string;
}

export function TrilhaCardBloqueavel({ 
  id, 
  titulo, 
  imagem_url, 
  bloqueada,
  visivel_apenas_pro,
  nivel_minimo_acesso,
  isVisitante = false,
  temConteudoDisponivel = true,
  aspectRatio = "9/16"
}: TrilhaCardBloqueavelProps) {
  
  // VISITANTE sem conteúdo disponível → Cadeado clicável para /aplique
  if (isVisitante && !temConteudoDisponivel) {
    return (
      <Link to="/servicos" className="block">
        <div className="relative overflow-hidden rounded-xl shadow-md w-full bg-muted border-2 border-primary/10 cursor-pointer hover:shadow-lg transition-shadow aspect-[9/16]">
          <img
            src={imagem_url || "/placeholder.svg"}
            alt={titulo}
            loading="lazy"
            className="block w-full h-full object-cover object-center opacity-50 grayscale"
          />
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-4 md:p-6 shadow-2xl">
              <Lock className="h-8 w-8 md:h-12 md:w-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold text-center text-sm md:text-base">{titulo}</p>
          </div>
        </div>
      </Link>
    );
  }

  // MENTORADO com trilha bloqueada → "Em Breve" (clicável para preview)
  if (!isVisitante && bloqueada) {
    return (
      <Link to={`/trilhas/${id}`} className="block">
        <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg w-full bg-muted border-2 border-primary/10 hover:border-primary/20 cursor-pointer transition-all aspect-[9/16]">
          {visivel_apenas_pro && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-primary text-primary-foreground px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 shadow-lg">
              🔒 PRO
            </div>
          )}
          {nivel_minimo_acesso === 'club' && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-amber-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 shadow-lg">
              ⭐ Club
            </div>
          )}
          
          <img
            src={imagem_url || "/placeholder.svg"}
            alt={titulo}
            loading="lazy"
            className="block w-full h-full object-cover object-center opacity-50 grayscale"
          />
          
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-muted/90 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 shadow-2xl flex items-center gap-1.5">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-foreground" strokeWidth={2} />
              <span className="text-foreground font-medium text-xs md:text-sm">Em Breve</span>
            </div>
          </div>
          
          {/* Título embaixo */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold text-center text-sm md:text-base">{titulo}</p>
          </div>
        </div>
      </Link>
    );
  }

  // Trilha disponível → Card normal clicável
  return (
    <Link to={`/trilhas/${id}`} className="block group">
      <div className="overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 relative w-full bg-muted border-2 border-primary/10 hover:border-primary/30 aspect-[9/16]">
        {visivel_apenas_pro && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-primary text-primary-foreground px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 shadow-lg">
            🔒 PRO
          </div>
        )}
        {nivel_minimo_acesso === 'club' && (
          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-amber-500 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 shadow-lg">
            ⭐ Club
          </div>
        )}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
          <FavoriteButton 
            tipo="trilha" 
            itemId={id}
            variant="icon-only"
            size="md"
          />
        </div>
        <img
          src={imagem_url || "/placeholder.svg"}
          alt={titulo}
          loading="lazy"
          className="block w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
}
