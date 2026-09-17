import { motion } from "framer-motion";

import { CartaoMetrica, CartaoMetricaSkeleton } from "@/components/dashboard/CartaoMetrica";
import { listaCascata } from "@/lib/motion";
import {
  emPercentual,
  emReais,
  rotuloPapel,
  type ProgramaPapel,
  type ProgramaRegra,
} from "@/integrations/supabase/programa";
import type { IndicacaoComRecompensa } from "@/hooks/useIndicacoes";
import { valorDoCashback } from "@/hooks/useRecompensas";

interface ResumoProgramaProps {
  papel: ProgramaPapel;
  regra: ProgramaRegra | null;
  percentualProxima: number | null;
  indicacoes: IndicacaoComRecompensa[];
  carregando: boolean;
}

/**
 * Os quatro números que a pessoa abre o painel para ver: o formato dela, o
 * quanto a próxima indicação vale, o que já entrou e o que está em andamento.
 */
export function ResumoPrograma({
  papel,
  regra,
  percentualProxima,
  indicacoes,
  carregando,
}: ResumoProgramaProps) {
  if (carregando) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <CartaoMetricaSkeleton key={i} />
        ))}
      </div>
    );
  }

  const fechadas = indicacoes.filter((i) => i.status === "fechada");
  const emAndamento = indicacoes.filter(
    (i) => i.status !== "fechada" && i.status !== "perdida",
  );

  // Conta o que os fechamentos geram em dinheiro, inclusive o que a equipe
  // ainda não confirmou: enquanto o valor não está fechado, dá para prever
  // pelo valor do projeto e pelo percentual. Bônus não entra, porque não é
  // um número que soma aqui.
  const totalGerado = fechadas.reduce((soma, indicacao) => {
    const recompensa = indicacao.recompensa;
    if (!recompensa || recompensa.status === "cancelada") return soma;
    if (recompensa.tipo === "bonus") return soma;
    return soma + (valorDoCashback(recompensa) ?? 0);
  }, 0);

  const jaPago = fechadas.reduce((soma, indicacao) => {
    const recompensa = indicacao.recompensa;
    if (!recompensa) return soma;
    const pagoEmParcelas = recompensa.parcelas
      .filter((p) => p.pago_em)
      .reduce((s, p) => s + p.valor, 0);
    if (pagoEmParcelas > 0) return soma + pagoEmParcelas;
    return recompensa.status === "paga" ? soma + (recompensa.valor ?? 0) : soma;
  }, 0);

  const taxaProxima =
    percentualProxima !== null
      ? emPercentual(percentualProxima)
      : regra?.percentual_base !== null && regra?.percentual_base !== undefined
        ? emPercentual(regra.percentual_base)
        : "Split";

  const apoioTaxa =
    percentualProxima !== null && regra
      ? `Sobe ${emPercentual(regra.percentual_incremento)} a cada fechamento.`
      : "Negociado por projeto, sem tabela fixa.";

  return (
    <motion.div
      variants={listaCascata}
      initial="inicial"
      animate="ativo"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <CartaoMetrica
        rotulo="Seu formato"
        valor={<span className="text-2xl md:text-3xl">{rotuloPapel(papel.papel)}</span>}
        apoio={regra?.observacao ?? undefined}
      />
      <CartaoMetrica
        rotulo="Próxima fechada vale"
        valor={taxaProxima}
        apoio={apoioTaxa}
      />
      <CartaoMetrica
        rotulo="Já gerado"
        valor={<span className="text-2xl md:text-3xl">{emReais(totalGerado)}</span>}
        apoio={
          jaPago > 0
            ? `${emReais(jaPago)} já liberado conforme o indicado paga.`
            : "Liberado conforme o indicado paga."
        }
      />
      <CartaoMetrica
        rotulo="Em andamento"
        valor={emAndamento.length}
        apoio={
          regra?.volume_minimo_mes
            ? `Seu formato pede ${regra.volume_minimo_mes} ${regra.volume_minimo_mes === 1 ? "nome" : "nomes"} por mês.`
            : `${fechadas.length} ${fechadas.length === 1 ? "fechada" : "fechadas"} até aqui.`
        }
      />
    </motion.div>
  );
}
