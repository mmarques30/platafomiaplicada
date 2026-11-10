/**
 * Quebra títulos do tipo "Prompt-base — Landing Page de Isca" ou
 * "Dashboard Financeiro | Controle de Finanças" em um rótulo curto (eyebrow)
 * e o título limpo, sem travessão ou barra no meio.
 *
 * Morava dentro do `PromptCard`, que era um componente que nenhuma tela
 * chegou a usar: a biblioteca de prompts sempre renderizou a linha, não o
 * cartão. Com o cartão removido, a função veio para cá, que é onde ela
 * deveria estar desde o começo — é uma regra de texto, não de desenho.
 */
export function splitTitulo(titulo: string): { eyebrow: string | null; titulo: string } {
  const m = titulo.match(/^(.{2,40}?)\s+(?:—|–|\||-)\s+(.+)$/);
  if (!m) return { eyebrow: null, titulo };
  return { eyebrow: m[1].trim(), titulo: m[2].trim() };
}
