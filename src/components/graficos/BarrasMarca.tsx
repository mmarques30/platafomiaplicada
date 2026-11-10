import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DicaValor } from "./DicaValor";
import { COR_PRINCIPAL, EIXO, GRADE, curto } from "./tema";

interface BarrasMarcaProps {
  dados: Array<{ nome: string; valor: number; destaque?: boolean }>;
  /** "horizontal" ordena e serve para "quem é maior" em célula estreita. */
  orientacao?: "vertical" | "horizontal";
  formatar?: (valor: number) => string;
  aoClicar?: (item: { nome: string; valor: number }) => void;
}

/**
 * Comparação entre categorias.
 *
 * Em célula estreita vai deitado e ordenado, que é o jeito honesto de
 * responder "quem é maior": o olho compara comprimentos a partir de uma
 * base comum. Em célula larga fica em pé, para o eixo do tempo caber.
 *
 * A barra em destaque é a única colorida com força; as outras ficam na
 * cor da marca rebaixada. Pintar todas igual faz o olho procurar o que
 * importa; pintar cada uma de uma cor inventa significado que não existe.
 */
export function BarrasMarca({ dados, orientacao = "vertical", formatar, aoClicar }: BarrasMarcaProps) {
  const escrever = formatar ?? curto;
  const deitado = orientacao === "horizontal";
  const ordenados = deitado ? [...dados].sort((a, b) => b.valor - a.valor) : dados;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={ordenados}
        layout={deitado ? "vertical" : "horizontal"}
        margin={deitado ? { top: 4, right: 16, bottom: 4, left: 4 } : { top: 8, right: 8, bottom: 0, left: -18 }}
        barCategoryGap={deitado ? "28%" : "32%"}
      >
        <CartesianGrid {...GRADE} vertical={deitado} horizontal={!deitado} />
        {deitado ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} tick={EIXO} tickFormatter={escrever} />
            <YAxis type="category" dataKey="nome" tickLine={false} axisLine={false} tick={EIXO} width={104} />
          </>
        ) : (
          <>
            <XAxis dataKey="nome" tickLine={false} axisLine={false} tick={EIXO} dy={8} />
            <YAxis tickLine={false} axisLine={false} tick={EIXO} tickFormatter={escrever} width={52} />
          </>
        )}
        <Tooltip
          content={<DicaValor formatar={(v) => escrever(v)} />}
          cursor={{ fill: "hsl(var(--primary) / 0.07)" }}
        />
        <Bar
          dataKey="valor"
          name="Total"
          radius={deitado ? [0, 6, 6, 0] : [6, 6, 0, 0]}
          animationDuration={700}
          onClick={(item) => aoClicar?.(item as unknown as { nome: string; valor: number })}
          cursor={aoClicar ? "pointer" : undefined}
        >
          {ordenados.map((item, i) => (
            <Cell
              key={item.nome}
              fill={COR_PRINCIPAL}
              fillOpacity={item.destaque ? 1 : 0.85 - Math.min(i, 5) * 0.11}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
