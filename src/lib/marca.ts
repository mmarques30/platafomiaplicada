/**
 * A geometria do símbolo da IAplicada, separada do componente para que a
 * animação de entrada possa desenhar o mesmo caminho sem importar React.
 * A explicação da forma está em `components/shared/MarcaIAplicada.tsx`.
 */

const LADO = 46;
const RAIO_FORA = 46;
const RAIO_DENTRO = 26;

/**
 * A folha de cima à esquerda, no quadrado (0,0)-(46,46). Começa na ponta de
 * cima à direita, desce a aresta direita, dobra para dentro, corre a aresta de
 * baixo até a ponta de baixo à esquerda, e volta pelo arco de fora.
 */
const FOLHA = [
  `M${LADO},0`,
  `L${LADO},${LADO - RAIO_DENTRO}`,
  `A${RAIO_DENTRO},${RAIO_DENTRO} 0 0 1 ${LADO - RAIO_DENTRO},${LADO}`,
  `L0,${LADO}`,
  `A${RAIO_FORA},${RAIO_FORA} 0 0 1 ${LADO},0`,
  "Z",
].join(" ");

/** As quatro folhas, no sentido horário a partir da de cima à esquerda. */
export const FOLHAS = [
  { giro: 0, tom: "claro" },
  { giro: 90, tom: "escuro" },
  { giro: 180, tom: "medio" },
  { giro: 270, tom: "palido" },
] as const;

/** Os quatro tons da marca, como no arquivo original. */
export const TONS_MARCA = {
  claro: "#d8e4ab",
  escuro: "#6d9024",
  medio: "#8fbc2e",
  palido: "#e6ecc9",
} as const;

/** O caminho de uma folha. As outras são este girado em torno de (50,50). */
export const CAMINHO_FOLHA = FOLHA;
