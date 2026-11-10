import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DicaValor } from "./DicaValor";
import { COR_COMPARACAO, COR_PRINCIPAL, EIXO, GRADE, MARGEM, curto } from "./tema";

export interface SerieArea {
  chave: string;
  nome: string;
  /** Série de comparação: fica em cinza, fina e tracejada. */
  comparacao?: boolean;
}

interface AreaMarcaProps {
  dados: Array<Record<string, string | number>>;
  /** O campo do eixo horizontal. */
  eixoX: string;
  series: SerieArea[];
  /** Id único do degradê na página. */
  id: string;
  formatar?: (valor: number) => string;
  /** Clique num ponto: leva à lista daquele recorte. */
  aoClicar?: (ponto: Record<string, string | number>) => void;
}

/**
 * Evolução no tempo, com o preenchimento em degradê.
 *
 * O degradê não é enfeite: ele é o que separa a área da grade sem
 * precisar de uma borda dura, e o que dá a impressão de profundidade
 * que a referência tem. A série de comparação entra em cinza fino, por
 * trás, para o olho ler "antes e agora" sem legenda.
 */
export function AreaMarca({ dados, eixoX, series, id, formatar, aoClicar }: AreaMarcaProps) {
  const escrever = formatar ?? curto;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={dados}
        margin={MARGEM}
        onClick={(e) => {
          const ponto = e?.activePayload?.[0]?.payload;
          if (ponto && aoClicar) aoClicar(ponto);
        }}
      >
        <defs>
          {series.map((serie, i) => (
            <linearGradient key={serie.chave} id={`area-${id}-${serie.chave}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={serie.comparacao ? COR_COMPARACAO : COR_PRINCIPAL} stopOpacity={serie.comparacao ? 0.12 : 0.34 - i * 0.08} />
              <stop offset="100%" stopColor={serie.comparacao ? COR_COMPARACAO : COR_PRINCIPAL} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid {...GRADE} vertical={false} />
        <XAxis dataKey={eixoX} tickLine={false} axisLine={false} tick={EIXO} dy={8} />
        <YAxis tickLine={false} axisLine={false} tick={EIXO} tickFormatter={escrever} width={52} />
        <Tooltip
          content={<DicaValor formatar={(v) => escrever(v)} />}
          cursor={{ stroke: "hsl(var(--primary) / 0.45)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        {series.length > 1 && (
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
          />
        )}

        {series.map((serie) => (
          <Area
            key={serie.chave}
            type="monotone"
            dataKey={serie.chave}
            name={serie.nome}
            stroke={serie.comparacao ? COR_COMPARACAO : COR_PRINCIPAL}
            strokeWidth={serie.comparacao ? 1.25 : 2.25}
            strokeDasharray={serie.comparacao ? "4 4" : undefined}
            fill={`url(#area-${id}-${serie.chave})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
            dot={false}
            animationDuration={700}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
