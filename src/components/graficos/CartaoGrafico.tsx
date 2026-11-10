import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface CartaoGraficoProps {
  titulo: string;
  /** O que o gráfico responde. Uma frase, não um parágrafo. */
  leitura?: ReactNode;
  /** Controles à direita do título: período, alternância, link. */
  acao?: ReactNode;
  /** Altura do corpo. A linha da grade manda; o card obedece. */
  className?: string;
  children: ReactNode;
}

/**
 * A moldura de todo gráfico da plataforma.
 *
 * Resolve o defeito mais repetido em painel: faixa branca dentro do
 * card. O card é uma coluna flex de altura cheia, o cabeçalho tem a
 * altura do seu conteúdo e o corpo leva `flex-1 min-h-0`. O
 * `ResponsiveContainer` lá dentro pede 100% dos dois lados e passa a
 * preencher exatamente o que sobrou, em qualquer largura de tela.
 *
 * A linha de leitura existe porque gráfico sem conclusão é decoração.
 * Quem abre o painel quer saber o que mudou, não interpretar eixos.
 */
export function CartaoGrafico({ titulo, leitura, acao, className, children }: CartaoGraficoProps) {
  return (
    <section className={cn("superficie superficie-interativa flex h-full flex-col p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="titulo-bloco text-sm text-foreground">{titulo}</h3>
          {leitura && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <span className="min-w-0">{leitura}</span>
            </p>
          )}
        </div>
        {acao && <div className="shrink-0">{acao}</div>}
      </header>

      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
