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
      "relative pl-10 pb-6",
      !isLast && "border-l-2 border-primary/30 ml-4"
    )}>
      {/* Número da etapa - círculo na timeline */}
      <div className={cn(
        "absolute -left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10",
        isFirst 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "bg-card border-2 border-primary/50 text-primary"
      )}>
        {etapa.numero}
      </div>
      
      {/* Conteúdo da etapa */}
      <div className="bg-card rounded-xl p-4 ml-2 border border-border hover:border-primary/30 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{etapa.titulo}</h3>
            <p className="text-primary text-sm mt-0.5">{etapa.objetivo}</p>
          </div>
          <Badge 
            variant="outline" 
            className="shrink-0 bg-primary/10 text-primary border-primary/30 gap-1 text-xs"
          >
            <Clock className="h-3 w-3" />
            {etapa.duracao_estimada}
          </Badge>
        </div>
        
        {/* Ferramentas */}
        {etapa.ferramentas && etapa.ferramentas.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
              <Wrench className="h-3 w-3" />
              Ferramentas para Dominar
            </h4>
            <div className="space-y-1.5">
              {etapa.ferramentas.map((f, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-accent/50">
                  <Badge className="bg-primary/20 text-primary border-primary/30 shrink-0 text-xs">
                    {f.nome}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{f.foco}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Trilhas Recomendadas */}
        {etapa.trilhas_recomendadas && etapa.trilhas_recomendadas.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
              <PlayCircle className="h-3 w-3" />
              Trilhas Recomendadas
            </h4>
            <div className="space-y-1">
              {etapa.trilhas_recomendadas.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-foreground p-2 rounded-lg bg-accent/50">
                  <PlayCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                  {t.titulo}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Entregável */}
        {etapa.entregavel && (
          <div className="pt-2 border-t border-border">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Target className="h-3 w-3" />
              Entregável
            </h4>
            <p className="text-xs text-foreground bg-primary/5 rounded-lg p-2.5 border border-primary/20">
              {etapa.entregavel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}