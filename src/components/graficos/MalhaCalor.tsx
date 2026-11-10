import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface CelulaCalor {
  /** Identificador único e legível, usado como chave e no tooltip. */
  chave: string;
  rotulo: string;
  /** 0 a 1. Zero fica apagado; um fica no lime cheio. */
  intensidade: number;
  detalhe?: string;
}

interface MalhaCalorProps {
  celulas: CelulaCalor[];
  /** Quantas colunas. No celular o componente já reduz sozinho. */
  colunas?: number;
  /** Lado máximo de cada quadradinho, em px. Sem isto a malha estica e
      vira uma grade de blocos, que perde a leitura de densidade. */
  ladoMaximo?: number;
  className?: string;
}

/**
 * A malha de quadradinhos, como o mapa de saúde do campo da referência.
 *
 * Responde "como isso se distribuiu" num espaço minúsculo, sem eixo
 * nenhum. Serve para constância no tempo (estudou ou não estudou, dia a
 * dia), que é uma pergunta que linha e barra respondem mal porque o
 * dado é denso e binário na maior parte dos dias.
 *
 * A intensidade vira opacidade sobre a cor da marca, e não uma escala de
 * cores diferentes: o olho lê "mais forte, mais fraco" sem legenda.
 */
export function MalhaCalor({ celulas, colunas = 14, ladoMaximo = 26, className }: MalhaCalorProps) {
  // 6px é o gap; a conta deixa a malha parar de crescer no lado máximo em
  // vez de esticar até a largura do card.
  const larguraMaxima = colunas * ladoMaximo + (colunas - 1) * 6;

  return (
    <TooltipProvider delayDuration={120}>
      <div
        className={cn("grid gap-1.5", className)}
        style={{
          gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`,
          maxWidth: larguraMaxima,
        }}
      >
        {celulas.map((celula) => {
          const forca = Math.max(0, Math.min(1, celula.intensidade));
          return (
            <Tooltip key={celula.chave}>
              <TooltipTrigger asChild>
                <div
                  className="aspect-square rounded-[4px] border border-border/60 transition-transform duration-150 hover:scale-125"
                  style={{
                    background:
                      forca === 0
                        ? "hsl(var(--muted) / 0.5)"
                        : `hsl(var(--lime) / ${0.18 + forca * 0.82})`,
                  }}
                  aria-label={`${celula.rotulo}${celula.detalhe ? `: ${celula.detalhe}` : ""}`}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p className="font-medium">{celula.rotulo}</p>
                {celula.detalhe && <p className="text-muted-foreground">{celula.detalhe}</p>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
