import { Badge } from "@/components/ui/badge";
import { PlayCircle, Wrench, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ferramenta {
  nome: string;
  foco: string;
}

interface TrilhaRecomendada {
  trilha_id: string;
  titulo: string;
}

export interface Etapa {
  numero: number;
  titulo: string;
  objetivo: string;
  duracao_estimada: string;
  ferramentas: Ferramenta[];
  trilhas_recomendadas: TrilhaRecomendada[];
  entregavel: string;
}

interface EtapaEvolucaoProps {
  etapa: Etapa;
  isFirst: boolean;
  isLast: boolean;
}

export function EtapaEvolucao({ etapa, isFirst, isLast }: EtapaEvolucaoProps) {
  return (
    <div className={cn(
      "relative pl-10 pb-8",
      !isLast && "border-l-2 border-aplicada-green/30 ml-4"
    )}>
      {/* Número da etapa - círculo na timeline */}
      <div className={cn(
        "absolute -left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10",
        isFirst 
          ? "bg-aplicada-green text-white shadow-lg shadow-aplicada-green/30" 
          : "bg-aplicada-dark border-2 border-aplicada-green/50 text-aplicada-green"
      )}>
        {etapa.numero}
      </div>
      
      {/* Conteúdo da etapa */}
      <div className="bg-aplicada-dark/50 rounded-xl p-5 ml-2 border border-aplicada-green/20 hover:border-aplicada-green/40 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{etapa.titulo}</h3>
            <p className="text-aplicada-green text-sm mt-1">{etapa.objetivo}</p>
          </div>
          <Badge 
            variant="outline" 
            className="shrink-0 bg-aplicada-green/10 text-aplicada-green border-aplicada-green/30 gap-1"
          >
            <Clock className="h-3 w-3" />
            {etapa.duracao_estimada}
          </Badge>
        </div>
        
        {/* Ferramentas */}
        {etapa.ferramentas && etapa.ferramentas.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-aplicada-green/70 mb-2 flex items-center gap-1.5">
              <Wrench className="h-3 w-3" />
              Ferramentas para Dominar
            </h4>
            <div className="space-y-2">
              {etapa.ferramentas.map((f, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/20">
                  <Badge className="bg-aplicada-green/20 text-aplicada-green border-aplicada-green/30 shrink-0">
                    {f.nome}
                  </Badge>
                  <span className="text-sm text-white/70">{f.foco}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Trilhas Recomendadas */}
        {etapa.trilhas_recomendadas && etapa.trilhas_recomendadas.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-aplicada-green/70 mb-2 flex items-center gap-1.5">
              <PlayCircle className="h-3 w-3" />
              Trilhas Recomendadas
            </h4>
            <div className="space-y-1.5">
              {etapa.trilhas_recomendadas.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-white/80 p-2 rounded-lg bg-black/20">
                  <PlayCircle className="h-4 w-4 text-aplicada-green shrink-0" />
                  {t.titulo}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Entregável */}
        {etapa.entregavel && (
          <div className="pt-3 border-t border-aplicada-green/20">
            <h4 className="text-xs uppercase tracking-wide text-aplicada-green/70 mb-2 flex items-center gap-1.5">
              <Target className="h-3 w-3" />
              Entregável
            </h4>
            <p className="text-sm text-white/90 bg-aplicada-green/10 rounded-lg p-3 border border-aplicada-green/20">
              {etapa.entregavel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}