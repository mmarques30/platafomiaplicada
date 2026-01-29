import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ToolLogo } from "@/components/shared/ToolLogo";
import { Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ferramenta {
  id: string;
  nome: string;
  logo_url: string | null;
  categoria: string;
  avaliacao?: number | null;
  avaliacao_mari: number | null;
  avaliacao_comunidade: number | null;
  total_avaliacoes_comunidade: number | null;
  gratuito: boolean;
  link_ferramenta: string | null;
  objetivo: string;
  score_ranking?: number;
}

interface FerramentasRankingProps {
  ferramentas: Ferramenta[];
  onVerMais: (ferramenta: Ferramenta) => void;
}

export function FerramentasRanking({ ferramentas, onVerMais }: FerramentasRankingProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Ranking dinâmico: Top 5 ordenado por score_ranking
  const top5 = useMemo(() => {
    // Ferramentas já vêm ordenadas por score_ranking do hook
    // Pegar as 5 primeiras com alguma avaliação válida
    return ferramentas
      .filter(f => (f.avaliacao || 0) > 0 || (f.avaliacao_comunidade || 0) > 0)
      .slice(0, 5);
  }, [ferramentas]);

  if (top5.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 md:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Top 5 Ferramentas Recomendadas
        </h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Selecionadas e avaliadas pela Mari e comunidade
        </p>
      </div>

      {/* Dock flutuante com efeito glass */}
      <div className="relative flex justify-center mb-8">
        <div className="inline-flex items-end gap-2 md:gap-3 p-3 md:p-4 rounded-2xl glass-dock">
          {top5.map((ferramenta, idx) => (
            <button
              key={ferramenta.id}
              className={cn(
                "relative w-12 h-12 md:w-16 md:h-16 rounded-xl transition-all duration-300",
                "glass-card hover:scale-110 hover:-translate-y-2",
                "flex items-center justify-center",
                hoveredIndex === idx && "scale-110 -translate-y-2 ring-2 ring-primary/50"
              )}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onVerMais(ferramenta)}
            >
              {/* Número de posição */}
              <span className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                {idx + 1}
              </span>
              
              {/* Logo */}
              <ToolLogo 
                logoUrl={ferramenta.logo_url}
                toolName={ferramenta.nome}
                linkFerramenta={ferramenta.link_ferramenta}
                size="md"
                className="!bg-transparent"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards Glass */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {top5.map((ferramenta, idx) => (
          <div
            key={ferramenta.id}
            className={cn(
              "group relative rounded-xl p-4 transition-all duration-300 h-full flex flex-col",
              "glass-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
              hoveredIndex === idx && "border-primary/40 shadow-xl shadow-primary/10"
            )}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Conteúdo */}
            <div className="pt-2 flex flex-col flex-grow">
              {/* Logo pequena + Nome */}
              <div className="flex items-center gap-2">
                <ToolLogo 
                  logoUrl={ferramenta.logo_url}
                  toolName={ferramenta.nome}
                  linkFerramenta={ferramenta.link_ferramenta}
                  size="sm"
                />
                <h3 className="font-semibold text-sm line-clamp-1">{ferramenta.nome}</h3>
              </div>
              
              {/* Categoria */}
              <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground mt-3">
                {ferramenta.categoria}
              </span>

              {/* Objetivo */}
              <p className="text-xs text-muted-foreground line-clamp-2 h-[2.5rem] mt-3">
                {ferramenta.objetivo}
              </p>

              {/* Spacer para empurrar botões para baixo */}
              <div className="flex-grow" />

              {/* Avaliação Combinada */}
              <div className="flex items-center gap-1.5 mt-3">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-sm">
                  {ferramenta.score_ranking?.toFixed(1) || ferramenta.avaliacao_mari || 0}
                </span>
                <span className="text-xs text-muted-foreground">/ 5</span>
                {(ferramenta.total_avaliacoes_comunidade || 0) > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({ferramenta.total_avaliacoes_comunidade} votos)
                  </span>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={() => onVerMais(ferramenta)}
                >
                  Ver Detalhes
                </Button>
                {ferramenta.link_ferramenta && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <a
                      href={ferramenta.link_ferramenta}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
