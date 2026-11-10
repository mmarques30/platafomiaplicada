import type { TooltipProps } from "recharts";

type Formatador = (valor: number, nome: string) => string;

interface DicaValorProps extends TooltipProps<number, string> {
  /** Como escrever o valor. Por padrão, número em pt-BR. */
  formatar?: Formatador;
  /** Linha pequena abaixo do título, ex.: o período comparado. */
  nota?: string;
}

/**
 * A caixinha que aparece ao passar o mouse no gráfico.
 *
 * O tooltip de fábrica do Recharts é branco, quadrado e com a fonte do
 * sistema: destoa de tudo. Este fala a língua da plataforma — vidro,
 * rótulo em mono, valor tabular — e, principalmente, mostra o nome da
 * série junto do valor, que é o que falta para o gráfico ser legível
 * quando há mais de uma linha.
 */
export function DicaValor({ active, payload, label, formatar, nota }: DicaValorProps) {
  if (!active || !payload || payload.length === 0) return null;

  const escrever: Formatador =
    formatar ?? ((valor) => valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 }));

  return (
    <div className="vidro vidro-forte min-w-[150px] rounded-xl px-3 py-2.5">
      {label !== undefined && label !== null && (
        <p className="rotulo-mono mb-2 text-[10px]">{String(label)}</p>
      )}
      <ul className="space-y-1.5">
        {payload.map((item) => (
          <li key={String(item.dataKey)} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: item.color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
              {escrever(Number(item.value ?? 0), String(item.name ?? ""))}
            </span>
          </li>
        ))}
      </ul>
      {nota && <p className="mt-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">{nota}</p>}
    </div>
  );
}
