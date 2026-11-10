import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { COR_PRINCIPAL, sentidoDe } from "./tema";
import { CORES_ESTADO } from "./tema";

interface FaiscaProps {
  /** A série, do mais antigo para o mais recente. */
  dados: number[];
  /** Quando a queda é ruim, pinta de vermelho ao cair. */
  colorirPelaTendencia?: boolean;
  altura?: number;
  /** Id único do degradê; dois gráficos na mesma tela não podem repetir. */
  id: string;
}

/**
 * A linha miúda dentro do cartão de métrica.
 *
 * É o que transforma um número parado em leitura: mostra se ele chegou
 * ali subindo ou caindo, no espaço de uma linha de texto. Sem eixo,
 * sem grade, sem tooltip — quem quer o detalhe abre o gráfico grande.
 */
export function Faisca({ dados, colorirPelaTendencia, altura = 36, id }: FaiscaProps) {
  if (!dados || dados.length < 2) return null;

  const serie = dados.map((valor, i) => ({ i, valor }));
  const variacao = dados[dados.length - 1] - dados[0];
  const cor =
    colorirPelaTendencia && sentidoDe(variacao) === "desce" ? CORES_ESTADO.ruim : COR_PRINCIPAL;

  return (
    <div style={{ height: altura }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={serie} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`faisca-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="valor"
            stroke={cor}
            strokeWidth={1.75}
            fill={`url(#faisca-${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
