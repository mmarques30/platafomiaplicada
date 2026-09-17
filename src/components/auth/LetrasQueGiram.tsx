import { cn } from "@/lib/utils";

interface LetrasQueGiramProps {
  /** O texto do link. Só texto: cada letra vira dois elementos. */
  texto: string;
  className?: string;
}

/**
 * O texto que rola letra a letra quando o ponteiro passa.
 *
 * Cada letra existe duas vezes dentro de uma fresta: a de cima, visível, e
 * uma cópia logo abaixo. No hover as duas sobem juntas, e a de baixo toma o
 * lugar da de cima. O atraso cresce 18ms por letra, que é o que dá a sensação
 * de onda em vez de bloco.
 *
 * O texto de verdade fica num `sr-only`, e as letras são `aria-hidden`: quem
 * usa leitor de tela ouve a palavra inteira, não vinte letras soltas.
 * Movimento em CSS puro, sem JavaScript por letra.
 */
export function LetrasQueGiram({ texto, className }: LetrasQueGiramProps) {
  return (
    <span className={cn("ia-letras group/letras relative inline-flex", className)}>
      <span className="sr-only">{texto}</span>
      {[...texto].map((letra, indice) => (
        <span
          // A posição é a identidade aqui: letras repetem, índices não.
          key={`${letra}-${indice}`}
          aria-hidden="true"
          className="ia-letras__fresta"
          style={{ transitionDelay: `${indice * 18}ms` }}
        >
          <span className="ia-letras__cima" style={{ transitionDelay: `${indice * 18}ms` }}>
            {letra === " " ? " " : letra}
          </span>
          <span className="ia-letras__baixo" style={{ transitionDelay: `${indice * 18}ms` }}>
            {letra === " " ? " " : letra}
          </span>
        </span>
      ))}
    </span>
  );
}
