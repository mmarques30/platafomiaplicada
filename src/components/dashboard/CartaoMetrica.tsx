import { ReactNode } from "react";
import { motion } from "framer-motion";

import { ChipVariacao } from "@/components/graficos/ChipVariacao";
import { Faisca } from "@/components/graficos/Faisca";
import { itemCascata } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface CartaoMetricaProps {
  /** Rótulo em mono, caixa alta. Ex.: "Nível". */
  rotulo: string;
  /** O número, grande. */
  valor: ReactNode;
  /** Unidade ou complemento colado no número. Ex.: "2.140 XP". */
  unidade?: string;
  /** Linha de contexto embaixo. Ex.: "360 XP para o nível 5". */
  apoio?: ReactNode;
  /** Ícone discreto no canto, quando ajuda a identificar a métrica. */
  icone?: ReactNode;
  /** A série por trás do número, para a faísca. Precisa de 2 pontos ou mais. */
  serie?: number[];
  /** Variação contra o período anterior, em pontos percentuais. */
  variacao?: number | null;
  /** Quando subir é ruim (atrasos, pendências), inverte a cor do chip. */
  inverterVariacao?: boolean;
  /** Vidro em vez de card sólido: para quando o cartão fica sobre o painel de marca. */
  vidro?: boolean;
  className?: string;
}

/**
 * O cartão de métrica do painel.
 *
 * Era um retângulo chapado com rótulo e número, e nada mais. O número
 * ficava sem referência: 3 trilhas é muito ou pouco? subiu ou caiu?
 *
 * Agora o cartão carrega três camadas de leitura no mesmo espaço: o
 * número, para quem só passa o olho; o chip de variação, para quem quer
 * saber a direção; e a faísca, para quem quer ver o caminho. É a
 * composição da referência, e é o que transforma um painel bonito num
 * painel que responde.
 *
 * Em `vidro`, o cartão fica translúcido e deixa ver a marca do painel
 * atrás dele. É de propósito: a marca aparece através do cartão, em vez
 * de ser repetida dentro dele.
 */
export function CartaoMetrica({
  rotulo,
  valor,
  unidade,
  apoio,
  icone,
  serie,
  variacao,
  inverterVariacao,
  vidro,
  className,
}: CartaoMetricaProps) {
  const chave = rotulo.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    /*
     * No celular os três cartões empilham. Em bloco — rótulo, número,
     * faísca e apoio, cada um na sua linha — cada cartão passava de 140px,
     * e os três sozinhos comiam a tela inteira antes do primeiro conteúdo.
     * Ali o rótulo e o número dividem uma linha; a faísca e o apoio seguem
     * largos embaixo. A partir de `sm` volta tudo em bloco, como estava.
     */
    <motion.div
      variants={itemCascata}
      className={cn(
        "group grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-2 p-4",
        "sm:flex sm:flex-col sm:items-stretch sm:gap-3 md:p-5",
        vidro ? "vidro vidro-interativo" : "superficie superficie-interativa",
        className,
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <span className="rotulo-mono">{rotulo}</span>
        {icone && (
          <span className="hidden shrink-0 text-muted-foreground transition-colors group-hover:text-primary sm:block">
            {icone}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-1 sm:justify-start">
        <span className="numero-painel text-[28px] leading-none text-foreground sm:text-[32px] sm:leading-tight md:text-[38px]">
          {valor}
        </span>
        {unidade && <span className="text-sm text-muted-foreground">{unidade}</span>}
        <ChipVariacao
          valor={variacao}
          inverter={inverterVariacao}
          className="self-center sm:ml-auto"
        />
      </div>

      {serie && serie.length > 1 && (
        <div className="col-span-2 sm:w-full">
          <Faisca dados={serie} id={chave} altura={38} colorirPelaTendencia={inverterVariacao} />
        </div>
      )}

      {apoio && (
        <p className="col-span-2 text-xs leading-relaxed text-muted-foreground sm:w-full">
          {apoio}
        </p>
      )}
    </motion.div>
  );
}

/** Placeholder do cartão enquanto os números carregam. */
export function CartaoMetricaSkeleton({ vidro }: { vidro?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 md:p-5",
        vidro ? "vidro" : "superficie",
      )}
    >
      <div className="h-2.5 w-20 animate-skeleton-pulse rounded-full bg-foreground/[0.08]" />
      <div className="h-9 w-24 animate-skeleton-pulse rounded bg-foreground/[0.08]" />
      <div className="h-[38px] w-full animate-skeleton-pulse rounded bg-foreground/[0.05]" />
      <div className="h-2.5 w-28 animate-skeleton-pulse rounded-full bg-foreground/[0.06]" />
    </div>
  );
}
