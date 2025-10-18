/**
 * Sistema de cores para gráficos baseado no Branding IAplicada 2025
 * 
 * Paleta de cores verde (escala 900-100) extraída do Brand Book oficial
 */

export const chartColors = {
  // Paleta principal (tons de verde do branding)
  primary: [
    "hsl(var(--chart-1))", // Verde 900 - mais escuro
    "hsl(var(--chart-2))", // Verde 800
    "hsl(var(--chart-3))", // Verde 700 - primário
    "hsl(var(--chart-4))", // Verde 600
    "hsl(var(--chart-5))", // Verde 500
    "hsl(var(--chart-6))", // Verde 400 - mais claro
  ],
  
  // Estados especiais
  states: {
    positive: "hsl(var(--chart-3))", // Verde primário para positivo
    warning: "hsl(var(--chart-warning))", // Laranja para mediano
    error: "hsl(var(--chart-error))", // Vermelho para negativo
    neutral: "hsl(var(--chart-neutral))", // Cinza para neutro
  }
};

/**
 * Retorna cor baseada em um valor de performance (0-100)
 * 
 * @param value - Valor percentual de 0 a 100
 * @returns Cor HSL do design system
 */
export function getPerformanceColor(value: number): string {
  if (value >= 70) return chartColors.states.positive;
  if (value >= 40) return chartColors.states.warning;
  return chartColors.states.error;
}

/**
 * Retorna cor de uma escala com base no índice
 * Útil para gráficos com múltiplas séries
 * 
 * @param index - Índice da série (0-based)
 * @returns Cor HSL do design system
 */
export function getColorByIndex(index: number): string {
  return chartColors.primary[index % chartColors.primary.length];
}
