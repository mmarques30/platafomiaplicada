import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { DicaValor } from "./DicaValor";
import { corDaSerie, curto } from "./tema";

export interface FatiaRosca {
  nome: string;
  valor: number;
}

interface RoscaMarcaProps {
  dados: FatiaRosca[];
  /** O que vai no buraco do meio. Sem isto, a rosca é só um anel. */
  centroRotulo?: string;
  centroValor?: string;
  formatar?: (valor: number) => string;
  aoClicar?: (fatia: FatiaRosca) => void;
}

/**
 * Como um total se divide.
 *
 * Vive em célula estreita, porque em célula larga sobra espaço dos dois
 * lados do círculo. Os raios vão em porcentagem para o anel acompanhar o
 * card em vez de ficar com tamanho fixo.
 *
 * O total no centro é o que diferencia uma rosca útil de um enfeite:
 * sem ele a pessoa precisa somar as fatias de cabeça. A legenda fica
 * ao lado, clicável, com o valor de cada fatia já escrito.
 */
export function RoscaMarca({ dados, centroRotulo, centroValor, formatar, aoClicar }: RoscaMarcaProps) {
  const escrever = formatar ?? curto;
  const [oculta, setOculta] = useState<string[]>([]);
  const visiveis = dados.filter((d) => !oculta.includes(d.nome));
  const total = visiveis.reduce((soma, d) => soma + d.valor, 0);

  const alternar = (nome: string) =>
    setOculta((atual) => (atual.includes(nome) ? atual.filter((n) => n !== nome) : [...atual, nome]));

  return (
    /* `items-stretch` (o padrão) é obrigatório aqui: com `items-center`, o
       filho para de esticar e o ResponsiveContainer fica com altura zero —
       a legenda aparece e o anel não. */
    <div className="flex h-full min-h-0 flex-col gap-3 sm:flex-row">
      <div className="relative min-h-0 min-w-[120px] flex-1 self-stretch">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<DicaValor formatar={(v) => escrever(v)} />} />
            <Pie
              data={visiveis}
              dataKey="valor"
              nameKey="nome"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              animationDuration={700}
              onClick={(_, i) => aoClicar?.(visiveis[i])}
              cursor={aoClicar ? "pointer" : undefined}
            >
              {visiveis.map((fatia) => (
                <Cell key={fatia.nome} fill={corDaSerie(dados.findIndex((d) => d.nome === fatia.nome))} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {(centroValor || centroRotulo) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="numero-painel text-2xl text-foreground">
              {centroValor ?? escrever(total)}
            </span>
            {centroRotulo && <span className="rotulo-mono mt-1 text-[10px]">{centroRotulo}</span>}
          </div>
        )}
      </div>

      <ul className="flex shrink-0 flex-wrap content-center gap-x-4 gap-y-1.5 sm:w-[42%] sm:flex-col sm:justify-center sm:gap-2">
        {dados.map((fatia, i) => {
          const escondida = oculta.includes(fatia.nome);
          return (
            <li key={fatia.nome}>
              <button
                type="button"
                onClick={() => alternar(fatia.nome)}
                aria-pressed={!escondida}
                className="flex w-full items-center gap-2 text-left text-xs transition-opacity hover:opacity-80"
                style={{ opacity: escondida ? 0.4 : 1 }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: corDaSerie(i) }}
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate text-muted-foreground">{fatia.nome}</span>
                <span className="ml-auto shrink-0 font-mono tabular-nums text-foreground">
                  {escrever(fatia.valor)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
