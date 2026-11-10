import { useEffect, useMemo, useRef, useState } from "react";

import { TONS_MARCA } from "@/lib/marca";

/**
 * O fundo líquido do acesso, feito da folha da IAplicada.
 *
 * A referência usa esferas de mercúrio: bolas cinzentas que se fundem umas
 * nas outras por um filtro SVG. A ideia de líquido é boa; a bola, não, porque
 * bola não é de ninguém. Aqui a forma que flutua é a própria folha da marca.
 *
 * A folha é um quadrado com dois cantos opostos arredondados, o de fora num
 * quarto de círculo cheio e o que aponta para o centro um pouco mais fechado.
 * Em CSS isso é um `border-radius` de quatro valores, então cada folha é uma
 * div, não um SVG: dá para desfocar, girar e animar sem custo.
 *
 * O que funde as folhas é o filtro `gooey`: um borrão seguido de uma matriz de
 * cor que empurra o canal alfa para os extremos. O meio-tom do borrão vira
 * opaco perto das bordas e transparente longe delas, e duas folhas que se
 * aproximam passam a ter uma membrana entre elas. É o mesmo truque da
 * referência, com a forma e os quatro tons da marca.
 *
 * Três coisas que a referência não faz e que aqui são obrigatórias:
 *
 * - No celular são três folhas menores, não seis grandes: o filtro é caro e a
 *   tela é estreita.
 * - A paralaxe do mouse desliga no toque, onde não existe mouse, e com
 *   `prefers-reduced-motion`, junto da flutuação.
 * - A paralaxe anda pela margem, não pelo `transform`, que já é da animação.
 */

interface FolhasLiquidasProps {
  /** Quando true, as folhas ficam paradas no estado inicial. */
  segurar?: boolean;
}

const TONS = [TONS_MARCA.claro, TONS_MARCA.medio, TONS_MARCA.escuro, TONS_MARCA.palido] as const;

export function FolhasLiquidas({ segurar }: FolhasLiquidasProps) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [estreita, setEstreita] = useState(false);

  useEffect(() => {
    const medir = () => setEstreita(window.innerWidth < 768);
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  // Sorteadas uma vez por montagem: refazer a cada render faria as folhas
  // pularem de lugar a cada mudança de estado da tela.
  const folhas = useMemo(() => {
    const quantas = estreita ? 3 : 6;
    return Array.from({ length: quantas }).map((_, i) => ({
      lado: (estreita ? 130 : 210) + Math.random() * (estreita ? 70 : 150),
      esquerda: 6 + Math.random() * 78,
      topo: 6 + Math.random() * 78,
      giro: Math.random() * 360,
      atraso: -Math.random() * 20,
      duracao: 17 + Math.random() * 14,
      tom: TONS[i % TONS.length],
    }));
  }, [estreita]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const semMouse = window.matchMedia("(pointer: coarse)").matches;
    const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMouse || menosMovimento) return;

    const aoMover = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      refs.current.forEach((folha, i) => {
        if (!folha) return;
        const forca = (i + 1) * 11;
        folha.style.marginLeft = `${x * forca}px`;
        folha.style.marginTop = `${y * forca}px`;
      });
    };

    document.addEventListener("mousemove", aoMover);
    return () => document.removeEventListener("mousemove", aoMover);
  }, []);

  return (
    <div className="ia-login-fundo" aria-hidden="true">
      {/* O filtro que funde as folhas. Fica fora do fluxo, sem tamanho. */}
      <svg className="ia-login-filtro">
        <defs>
          <filter id="ia-gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="borrao" />
            <feColorMatrix
              in="borrao"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className="ia-login-palco"
        style={{ filter: "url(#ia-gooey)", opacity: segurar ? 0 : undefined }}
      >
        {folhas.map((folha, i) => (
          <div
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className="ia-login-folha"
            style={{
              width: folha.lado,
              height: folha.lado,
              left: `${folha.esquerda}%`,
              top: `${folha.topo}%`,
              animationDelay: `${folha.atraso}s`,
              animationDuration: `${folha.duracao}s`,
              background: `linear-gradient(135deg, ${folha.tom}, ${TONS_MARCA.escuro})`,
              ["--giro" as string]: `${folha.giro}deg`,
            }}
          />
        ))}
      </div>

      {/* O véu e o grão, nesta ordem: o véu devolve o contraste ao centro da
          tela, e o grão tira o aspecto de degradê liso que a fusão deixa. */}
      <div className="ia-login-veu" />
      <div className="ia-login-grao" />
    </div>
  );
}
