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
}

export function TrilhaCardBloqueavel({ 
  id, 
  titulo, 
  imagem_url, 
  bloqueada,
  visivel_apenas_pro,
  nivel_minimo_acesso,
  isVisitante = false,
  temConteudoDisponivel = true
}: TrilhaCardBloqueavelProps) {
  
  // VISITANTE sem conteúdo disponível → Cadeado clicável para /aplique
  if (isVisitante && !temConteudoDisponivel) {
    return (
      <Link to="/aplique" className="block">
        <div className="relative overflow-hidden rounded-xl shadow-md aspect-[9/16] w-full bg-muted border-2 border-primary/10 cursor-pointer hover:shadow-lg transition-shadow">
          <img
            src={imagem_url || "/placeholder.svg"}
            alt={titulo}
            loading="lazy"
            className="block w-full h-full object-cover object-center opacity-50 grayscale"
          />
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-6 shadow-2xl">
              <Lock className="h-12 w-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold text-center">{titulo}</p>
          </div>
        </div>
      </Link>
    );
  }

  // MENTORADO com trilha bloqueada → "Em Breve" (clicável para preview)
  if (!isVisitante && bloqueada) {
    return (
      <Link to={`/trilhas/${id}`} className="block">
        <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg aspect-[9/16] w-full bg-muted border-2 border-primary/10 hover:border-primary/20 cursor-pointer transition-all">
          {visivel_apenas_pro && (
            <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
              🔒 PRO
            </div>
          )}
          {nivel_minimo_acesso === 'club' && (
            <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
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
            <div className="bg-muted/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-2xl flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-foreground" strokeWidth={2} />
              <span className="text-foreground font-medium text-sm">Em Breve</span>
            </div>
          </div>
          
          {/* Título embaixo */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold text-center">{titulo}</p>
          </div>
        </div>
      </Link>
    );
  }

  // Trilha disponível → Card normal clicável
  return (
    <Link to={`/trilhas/${id}`} className="block group">
      <div className="overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 relative aspect-[9/16] w-full bg-muted border-2 border-primary/10 hover:border-primary/30">
        {visivel_apenas_pro && (
          <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
            🔒 PRO
          </div>
        )}
        {nivel_minimo_acesso === 'club' && (
          <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
            ⭐ Club
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
        <img
          src={imagem_url || "/placeholder.svg"}
          alt={titulo}
          loading="lazy"
          className="block w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
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
