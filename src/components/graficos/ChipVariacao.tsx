import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { sentidoDe } from "./tema";
import { cn } from "@/lib/utils";

interface ChipVariacaoProps {
  /** A variação em pontos percentuais. 12.5 vira "+12,5%". */
  valor: number | null | undefined;
  /** Texto no lugar da porcentagem, quando o dado não é percentual. */
  rotulo?: string;
  /** Quando subir é ruim (atraso, custo, erro), inverte a cor. */
  inverter?: boolean;
  className?: string;
}

/**
 * O "+12,5%" ao lado do número grande.
 *
 * Existe porque número sozinho não informa: 42 trilhas é muito ou
 * pouco? O chip responde com a única comparação que o painel tem, que
 * é o período anterior. Sem comparação, ele some em vez de mostrar
 * zero, para a tela não mentir que nada mudou.
 */
export function ChipVariacao({ valor, rotulo, inverter, className }: ChipVariacaoProps) {
  if (valor === null || valor === undefined) return null;

  const direcao = sentidoDe(valor);
  const sentido = inverter && direcao !== "igual" ? (direcao === "sobe" ? "desce" : "sobe") : direcao;
  const Icone = direcao === "sobe" ? ArrowUpRight : direcao === "desce" ? ArrowDownRight : Minus;

  const texto =
    rotulo ??
    `${valor > 0 ? "+" : ""}${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

  return (
    <span className={cn("chip-variacao", className)} data-sentido={sentido}>
      <Icone className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      {texto}
    </span>
  );
}
