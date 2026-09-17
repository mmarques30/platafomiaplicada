import { CAMINHO_FOLHA, FOLHAS, TONS_MARCA } from "@/lib/marca";
import { cn } from "@/lib/utils";

/**
 * O símbolo da IAplicada em vetor.
 *
 * Existia só como PNG, e o arquivo tem uma margem enorme em volta da marca:
 * ela ocupa pouco mais de um terço da altura da tela do arquivo. Com
 * `object-contain`, o que é encaixado na caixa é o arquivo inteiro, margem
 * incluída, então a marca saía pequena por mais que se aumentasse a altura do
 * elemento. Era por isso que ela parecia perdida dentro do botão da MarIAna.
 *
 * Em vetor a marca ocupa a caixa toda, fica nítida em qualquer tamanho, e
 * ganha uma coisa que o PNG não dá: um contorno que se desenha sozinho, que é
 * o que a animação de entrada usa.
 *
 * A forma são quatro folhas. Cada uma é um quadrado com dois cantos opostos
 * arredondados (o de fora, num quarto de círculo cheio, e o que aponta para o
 * centro, um pouco mais fechado) e os outros dois em ponta. As quatro são a
 * mesma folha girada de 90 em 90 graus em torno do centro, com um vão em cruz
 * entre elas.
 */

interface MarcaIAplicadaProps {
  className?: string;
  /**
   * "marca" usa os quatro tons originais. "mono" pinta tudo com a cor do
   * texto, para quando a marca vive dentro de outro elemento colorido.
   */
  variante?: "marca" | "mono";
  titulo?: string;
}

export function MarcaIAplicada({
  className,
  variante = "marca",
  titulo,
}: MarcaIAplicadaProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      role={titulo ? "img" : "presentation"}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {FOLHAS.map((folha) => (
        <path
          key={folha.tom}
          d={CAMINHO_FOLHA}
          transform={`rotate(${folha.giro} 50 50)`}
          fill={variante === "mono" ? "currentColor" : TONS_MARCA[folha.tom]}
        />
      ))}
    </svg>
  );
}
