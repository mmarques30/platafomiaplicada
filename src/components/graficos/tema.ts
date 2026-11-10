/**
 * O tema dos gráficos da plataforma.
 *
 * Um lugar só decide cor, curva, grade e eixo. Antes cada gráfico
 * escolhia a própria paleta na mão, e o painel saía arco-íris: três
 * gráficos vizinhos com três linguagens diferentes.
 *
 * A régua é a marca. O lime é sempre a série principal; as demais
 * descem pela escala tonal dela até o cinza. Vermelho, âmbar e azul
 * só entram quando significam estado (atrasado, atenção, informação),
 * nunca para diferenciar uma série da outra.
 */

/** A escala de séries, na ordem em que deve ser consumida. */
export const SERIES = [
  "hsl(var(--lime))",
  "hsl(var(--lime-glow))",
  "hsl(var(--olive))",
  "hsl(var(--sage))",
  "hsl(var(--status-info))",
] as const;

export const COR_PRINCIPAL = "hsl(var(--lime))";
export const COR_COMPARACAO = "hsl(var(--sage-dim))";

export const CORES_ESTADO = {
  bom: "hsl(var(--status-success))",
  atencao: "hsl(var(--status-warning))",
  ruim: "hsl(var(--status-danger))",
  info: "hsl(var(--status-info))",
} as const;

/** Cor da série n, repetindo a escala quando acabar. */
export function corDaSerie(indice: number): string {
  return SERIES[indice % SERIES.length];
}

/** Eixos e grade: discretos o bastante para o dado aparecer. */
export const EIXO = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const GRADE = {
  stroke: "hsl(var(--border))",
  strokeDasharray: "3 6",
} as const;

/** Margem padrão: dá ar ao rótulo sem deixar faixa vazia. */
export const MARGEM = { top: 8, right: 8, bottom: 0, left: -18 } as const;

/** Formata número grande sem poluir o eixo: 2400 vira "2,4 mil". */
export function curto(valor: number): string {
  if (Math.abs(valor) >= 1_000_000) return `${(valor / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (Math.abs(valor) >= 1_000) return `${(valor / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return valor.toLocaleString("pt-BR");
}

/** Em reais, sem centavos, que em painel só fazem ruído. */
export function emReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

/** Para onde o número andou, comparado ao anterior. */
export type Sentido = "sobe" | "desce" | "igual";

export function sentidoDe(variacao: number | null | undefined): Sentido {
  if (variacao === null || variacao === undefined || Math.abs(variacao) < 0.05) return "igual";
  return variacao > 0 ? "sobe" : "desce";
}
