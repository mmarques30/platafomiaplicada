// Taxonomia oficial de ferramentas/modelos de IA usada para classificar
// trilhas (e potencialmente outros conteúdos) e para os filtros de "por ferramenta".
// Mantida em um único lugar para ficar consistente entre admin e área do aluno.
export const FERRAMENTAS_MODELOS_IA = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Google AI Studio",
  "Perplexity",
] as const;

export type FerramentaModeloIA = (typeof FERRAMENTAS_MODELOS_IA)[number];
