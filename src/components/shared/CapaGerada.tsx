import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Hash estável de um texto. Mesmo título, mesma capa, hoje e amanhã, aqui e
 * no celular — uma capa que muda a cada render não é identidade, é ruído.
 */
function semente(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Um número de `min` a `max` derivado da semente, por casa decimal. */
function entre(s: number, casa: number, min: number, max: number): number {
  const n = Math.floor(s / 10 ** casa) % 100;
  return min + (n / 99) * (max - min);
}

interface CapaGeradaProps {
  /** O texto que define a capa. Normalmente o título do conteúdo. */
  chave: string;
  /** Ícone do tipo, desenhado grande e apagado no canto. */
  icone?: LucideIcon;
  /** Duas ou três iniciais, para a capa dizer de que item se trata. */
  sigla?: string;
  /** Sem as iniciais, para capa baixa onde elas disputam com o conteúdo. */
  semSigla?: boolean;
  className?: string;
}

/**
 * A capa de um conteúdo que não tem imagem.
 *
 * O que havia antes era um degradê por tipo: toda notícia tinha a mesma capa
 * roxa, todo artigo a mesma capa lime. Numa grade de doze itens em que metade
 * não tem foto, isso vira seis retângulos idênticos — a capa deixava de
 * identificar o item e passava a identificar só a categoria, que a etiqueta
 * ao lado já diz.
 *
 * Aqui a capa é desenhada a partir do título: três manchas de luz em
 * posições e tamanhos tirados do hash, a malha de pontos da marca por cima e
 * a sigla do título em serif, grande e apagada, como o número nas capas de
 * trilha. Dois conteúdos diferentes nunca ficam iguais, e todos ficam da
 * mesma família — que é o padrão visual que faltava.
 *
 * É tudo SVG e CSS, sem rede e sem arquivo: funciona para conteúdo que
 * acabou de ser publicado, sem ninguém precisar subir uma imagem.
 */
export function CapaGerada({ chave, icone: Icone, sigla, semSigla, className }: CapaGeradaProps) {
  const manchas = useMemo(() => {
    const s = semente(chave || "iaplicada");
    return [
      { x: entre(s, 0, 10, 55), y: entre(s, 2, 15, 55), r: entre(s, 4, 38, 62), o: 0.32 },
      { x: entre(s, 1, 50, 92), y: entre(s, 3, 25, 80), r: entre(s, 5, 30, 52), o: 0.2 },
      { x: entre(s, 6, 20, 80), y: entre(s, 7, 55, 95), r: entre(s, 8, 24, 44), o: 0.13 },
    ];
  }, [chave]);

  const iniciais = useMemo(() => {
    if (sigla) return sigla;
    const palavras = (chave || "")
      .split(/\s+/)
      .filter((p) => p.length > 2)
      .slice(0, 2);
    return palavras.map((p) => p[0]?.toUpperCase() ?? "").join("") || "IA";
  }, [chave, sigla]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface", className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {manchas.map((m, i) => (
          <circle
            key={i}
            cx={m.x}
            cy={m.y}
            r={m.r}
            fill="hsl(var(--lime))"
            opacity={m.o}
            style={{ filter: "blur(18px)" }}
          />
        ))}
      </svg>

      {/* A malha de pontos da marca, que amarra a capa ao resto do sistema. */}
      <span aria-hidden="true" className="absolute inset-0 dot-grid-bg opacity-40" />

      {/* Véu escuro: as manchas são claras e as etiquetas por cima são claras. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-card via-card/72 to-card/38"
      />

      {!semSigla && (
        <span
          aria-hidden="true"
          className="font-serif-display absolute -bottom-5 left-3 text-[72px] leading-none tracking-tight text-foreground/[0.17]"
        >
          {iniciais}
        </span>
      )}

      {Icone && (
        <Icone
          aria-hidden="true"
          className="absolute -bottom-3 -right-2 h-24 w-24 text-foreground/[0.13]"
          strokeWidth={1.25}
        />
      )}
    </div>
  );
}
