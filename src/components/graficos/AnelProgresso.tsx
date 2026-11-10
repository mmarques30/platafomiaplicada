import { motion } from "framer-motion";

import { CORES_ESTADO, COR_PRINCIPAL } from "./tema";
import { cn } from "@/lib/utils";

interface AnelProgressoProps {
  /** 0 a 100. */
  valor: number;
  rotulo?: string;
  /** Texto no centro. Por padrão, a própria porcentagem. */
  centro?: string;
  /** Verde, âmbar ou vermelho conforme a faixa, em vez do lime. */
  porFaixa?: boolean;
  tamanho?: number;
  className?: string;
}

/**
 * O anel de progresso, como no painel de resiliência da referência.
 *
 * Mede o quanto falta de um alvo conhecido. Vale mais que uma barra
 * quando o número é a informação principal da célula: o anel reserva o
 * centro para ele, e o arco responde "quanto" sem precisar de eixo.
 *
 * O traço é desenhado com `strokeDasharray` sobre o perímetro, animado
 * do zero até o valor; `pathLength={1}` normalizaria, mas aqui o cálculo
 * explícito deixa o arco e o fundo compartilharem a mesma conta.
 */
export function AnelProgresso({
  valor,
  rotulo,
  centro,
  porFaixa,
  tamanho = 132,
  className,
}: AnelProgressoProps) {
  const limitado = Math.max(0, Math.min(100, valor));
  const traco = 9;
  const raio = (tamanho - traco) / 2;
  const perimetro = 2 * Math.PI * raio;

  const cor = porFaixa
    ? limitado >= 70
      ? CORES_ESTADO.bom
      : limitado >= 40
        ? CORES_ESTADO.atencao
        : CORES_ESTADO.ruim
    : COR_PRINCIPAL;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: tamanho, height: tamanho }}>
        <svg width={tamanho} height={tamanho} className="-rotate-90">
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={traco}
          />
          <motion.circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke={cor}
            strokeWidth={traco}
            strokeLinecap="round"
            strokeDasharray={perimetro}
            initial={{ strokeDashoffset: perimetro }}
            animate={{ strokeDashoffset: perimetro * (1 - limitado / 100) }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${cor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="numero-painel text-2xl text-foreground">
            {centro ?? `${Math.round(limitado)}%`}
          </span>
        </div>
      </div>
      {rotulo && <span className="rotulo-mono text-[10px]">{rotulo}</span>}
    </div>
  );
}
