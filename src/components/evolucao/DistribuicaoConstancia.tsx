import { useNavigate } from "react-router-dom";

import { CartaoGrafico, MalhaCalor, RoscaMarca } from "@/components/graficos";
import { useRitmoEstudo } from "@/hooks/useRitmoEstudo";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Onde o tempo foi, e em quais dias.
 *
 * Meu progresso respondia "quanto" de várias formas — XP, nível, total de
 * aulas, certificados — e nunca respondia "onde" nem "quando". Duas perguntas
 * que o banco já sabia responder, porque cada aula assistida tem data e
 * pertence a uma trilha.
 *
 * A rosca responde onde, com o total no meio. A malha responde quando, um
 * quadradinho por dia: é a pergunta que linha e barra respondem mal, porque o
 * dado é denso e quase binário — ou estudou naquele dia, ou não.
 */
export function DistribuicaoConstancia() {
  const navigate = useNavigate();
  const { dados, isLoading } = useRitmoEstudo();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[300px] rounded-[20px]" />
        <Skeleton className="h-[300px] rounded-[20px] lg:col-span-2" />
      </div>
    );
  }

  if (dados.totalPeriodo === 0) return null;

  const diasAtivos = dados.celulas.filter((c) => c.intensidade > 0).length;
  const melhor = dados.serie.reduce((a, b) => (b.aulas > a.aulas ? b : a), dados.serie[0]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="h-[300px]">
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
      </div>

      <div className="lg:col-span-2">
        <CartaoGrafico
          titulo="Constância"
          leitura={`Você estudou em ${diasAtivos} dos últimos 28 dias. O melhor foi ${melhor.dia}, com ${melhor.aulas} ${melhor.aulas === 1 ? "aula" : "aulas"}.`}
          className="h-full"
        >
          <div className="flex h-full flex-col gap-5 py-2 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[442px]">
              <MalhaCalor celulas={dados.celulas} colunas={14} />
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

            <dl className="grid grid-cols-3 gap-4 lg:flex-1 lg:grid-cols-1 lg:gap-3 lg:border-l lg:border-border/60 lg:pl-8">
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
                  {melhor.aulas}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    em {melhor.dia}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </CartaoGrafico>
      </div>
    </div>
  );
}
