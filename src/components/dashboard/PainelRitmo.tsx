import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { AreaMarca, CartaoGrafico, MalhaCalor, RoscaMarca } from "@/components/graficos";
import { useRitmoEstudo } from "@/hooks/useRitmoEstudo";
import { itemCascata, listaCascata, aoMontar } from "@/lib/motion";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * O painel de ritmo do aluno.
 *
 * A plataforma não tinha nenhum gráfico na área do aluno: só números
 * soltos em cartões. Quem entrava via "3 trilhas" e "0 dias" e não tinha
 * como saber se estava indo bem, se tinha parado, ou quando tinha
 * parado. Este painel responde essas três perguntas com os dados que já
 * existiam e ninguém estava mostrando.
 *
 * A composição segue o que as referências fazem bem: uma célula larga
 * para a evolução no tempo, uma estreita para a divisão, e uma linha
 * embaixo para a constância. Cada gráfico leva uma linha de
 * leitura — a conclusão escrita — porque gráfico que não conclui nada é
 * decoração.
 *
 * Quando não há nenhuma aula no período, o painel não aparece: um
 * punhado de gráficos zerados é pior que nada.
 */
export function PainelRitmo() {
  const navigate = useNavigate();
  const { dados, isLoading } = useRitmoEstudo();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[264px] rounded-[20px] lg:col-span-2 lg:h-[330px]" />
        <Skeleton className="h-[264px] rounded-[20px] lg:h-[330px]" />
      </div>
    );
  }

  if (dados.totalPeriodo === 0) return null;

  const ultimos7 = dados.serie.slice(-7).reduce((soma, p) => soma + p.aulas, 0);
  const diasAtivos = dados.serie.filter((p) => p.aulas > 0).length;
  const melhorDia = dados.serie.reduce((a, b) => (b.aulas > a.aulas ? b : a), dados.serie[0]);

  const leituraEvolucao = (() => {
    const v = dados.variacaoSemana;
    if (v === null) return `${ultimos7} ${ultimos7 === 1 ? "aula" : "aulas"} nos últimos sete dias.`;
    if (v > 5) return `Você acelerou ${Math.round(v)}% nesta semana contra a anterior.`;
    if (v < -5) return `Caiu ${Math.abs(Math.round(v))}% nesta semana. Uma aula hoje já vira o jogo.`;
    return "Seu ritmo está estável em relação à semana passada.";
  })();

  return (
    <motion.div variants={listaCascata} {...aoMontar} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Célula larga: evolução no tempo. Área com degradê, como a
            referência, para separar o dado da grade sem borda dura. */}
        <motion.div variants={itemCascata} className="h-[264px] lg:col-span-2 lg:h-[330px]">
          <CartaoGrafico titulo="Seu ritmo nas últimas quatro semanas" leitura={leituraEvolucao}>
            <AreaMarca
              id="ritmo"
              dados={dados.serie}
              eixoX="dia"
              series={[{ chave: "aulas", nome: "Aulas assistidas" }]}
              formatar={(v) => String(Math.round(v))}
              aoClicar={() => navigate("/trilhas")}
            />
          </CartaoGrafico>
        </motion.div>

        {/* Célula estreita: divisão. Rosca, que só funciona aqui. */}
        <motion.div variants={itemCascata} className="h-[264px] lg:h-[330px]">
          <CartaoGrafico
            titulo="Onde seu tempo foi"
            leitura={
              dados.porTrilha.length > 0
                ? `${dados.porTrilha[0].nome} concentra a maior parte das aulas concluídas.`
                : "Conclua uma aula para esta divisão aparecer."
            }
          >
            {dados.porTrilha.length > 0 ? (
              <RoscaMarca
                dados={dados.porTrilha}
                centroRotulo="concluídas"
                aoClicar={() => navigate("/trilhas")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                Nenhuma aula concluída no período.
              </div>
            )}
          </CartaoGrafico>
        </motion.div>
      </div>

      {/* Constância ocupa a linha inteira. Ao lado dela ficava um anel com
          o nível e o XP que faltava — exatamente o que o cartão "Nível" do
          cabeçalho já diz, três blocos acima, e o que a página Meu progresso
          mostra por extenso. Eram 330px de altura para repetir um número que
          a pessoa já tinha lido. */}
      <div className="grid grid-cols-1 gap-4">
        <motion.div variants={itemCascata}>
          <CartaoGrafico
            titulo="Constância"
            leitura={`Você estudou em ${diasAtivos} dos últimos 28 dias. O melhor foi ${melhorDia.dia}, com ${melhorDia.aulas} ${melhorDia.aulas === 1 ? "aula" : "aulas"}.`}
            className="h-full"
          >
            <div className="flex h-full flex-col gap-5 py-2 lg:flex-row lg:items-center lg:gap-8">
              {/* Com a linha inteira para si, a malha abre os 28 dias numa
                  fileira só: lê-se o mês da esquerda para a direita, sem
                  quebra no meio da semana. Em duas fileiras de 14 ela
                  ocupava o dobro da altura para dizer o mesmo. */}
              <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
                <MalhaCalor celulas={dados.celulas} colunas={14} ladoMaximo={30} className="lg:hidden" />
                <MalhaCalor
                  celulas={dados.celulas}
                  colunas={28}
                  ladoMaximo={30}
                  className="hidden lg:grid"
                />
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>Menos</span>
                  {[0, 0.25, 0.5, 0.75, 1].map((n) => (
                    <span
                      key={n}
                      className="h-2.5 w-2.5 rounded-[3px] border border-border/60"
                      style={{
                        background:
                          n === 0 ? "hsl(var(--muted) / 0.5)" : `hsl(var(--lime) / ${0.18 + n * 0.82})`,
                      }}
                    />
                  ))}
                  <span>Mais</span>
                </div>
              </div>

              {/* O resumo ao lado da malha: sem ele a célula larga ficava
                  com metade do card vazia, que é o defeito que a malha
                  limitada em largura criaria sozinha. */}
              <dl className="grid shrink-0 grid-cols-3 gap-4 lg:gap-8 lg:border-l lg:border-border/60 lg:pl-8">
                <div>
                  <dt className="rotulo-mono text-[10px]">Dias ativos</dt>
                  <dd className="numero-painel mt-1 text-xl text-foreground">
                    {diasAtivos}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">de 28</span>
                  </dd>
                </div>
                <div>
                  <dt className="rotulo-mono text-[10px]">Aulas no mês</dt>
                  <dd className="numero-painel mt-1 text-xl text-foreground">{dados.totalPeriodo}</dd>
                </div>
                <div>
                  <dt className="rotulo-mono text-[10px]">Melhor dia</dt>
                  <dd className="numero-painel mt-1 text-xl text-foreground">
                    {melhorDia.aulas}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      em {melhorDia.dia}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </CartaoGrafico>
        </motion.div>

      </div>
    </motion.div>
  );
}
