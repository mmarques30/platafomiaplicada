/**
 * Ordena itens de menu pelo tamanho do nome: primeiro os de uma palavra,
 * do mais curto ao mais longo, depois os de duas, e assim por diante.
 * No empate, ordem alfabética.
 *
 * É o que deixa a borda direita da lista em escada em vez de serrilhada.
 * Parece detalhe, mas é o que separa uma barra lateral desenhada de uma
 * lista que foi caindo na tela na ordem em que alguém cadastrou.
 */
export function porTamanhoDoNome<T>(itens: T[], nomeDe: (item: T) => string): T[] {
  return [...itens].sort((a, b) => {
    const na = nomeDe(a);
    const nb = nomeDe(b);
    const palavrasA = na.trim().split(/\s+/).length;
    const palavrasB = nb.trim().split(/\s+/).length;
    if (palavrasA !== palavrasB) return palavrasA - palavrasB;
    if (na.length !== nb.length) return na.length - nb.length;
    return na.localeCompare(nb, "pt-BR");
  });
}
