import { useMemo } from "react";
import { format, isAfter, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAulasCalendario, type AulaSemanal } from "@/hooks/useCalendarioAulas";
import { Button } from "@/components/ui/button";

const NOME_TIPO: Record<string, string> = {
  aula_ao_vivo: "Aula ao vivo",
  qa: "Sessão de perguntas",
  live_youtube: "Live no YouTube",
  outro: "Encontro",
};

/**
 * O próximo encontro marcado, lido do calendário de aulas. Aula recorrente sem
 * data não entra: aqui só vale o que tem dia.
 */
function useProximoEncontro(): { aula: AulaSemanal | null; isLoading: boolean } {
  const { data: aulas, isLoading } = useAulasCalendario();

  const aula = useMemo(() => {
    if (!aulas?.length) return null;
    const hoje = startOfDay(new Date());
    return (
      aulas
        .filter((a) => a.data_aula && !a.realizada && isAfter(parseISO(a.data_aula), hoje))
        .sort((a, b) => parseISO(a.data_aula!).getTime() - parseISO(b.data_aula!).getTime())[0] ?? null
    );
  }, [aulas]);

  return { aula, isLoading };
}

/**
 * O que tem data marcada, como cartão da coluna lateral.
 *
 * Foi faixa larga no meio do fluxo, e a faixa tinha um problema: o dia, o
 * tema e o botão numa linha só deixavam o número da data — a informação que
 * se procura num cartão de agenda — do mesmo tamanho visual que tudo o resto.
 *
 * Na coluna estreita ele volta a ser o que é: o dia grande em serif no alto,
 * o mês e o dia da semana ao lado, o tema abaixo e o botão fechando o cartão.
 * A ordem de leitura passa a ser quando, o quê, e então entrar.
 */
export function ProximoEncontro() {
  const { aula, isLoading } = useProximoEncontro();

  if (isLoading) {
    return <div className="h-[200px] animate-skeleton-pulse rounded-card bg-card" />;
  }

  if (!aula) return null;

  const data = parseISO(aula.data_aula!);

  return (
    <section className="superficie flex flex-col gap-4 p-4 shadow-card md:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-serif-display text-[44px] leading-none text-foreground">
            {format(data, "dd")}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium capitalize text-foreground">
              {format(data, "MMMM", { locale: ptBR })}
            </span>
            <span className="rotulo-mono">
              {format(data, "EEEE", { locale: ptBR })}
              {aula.horario ? ` · ${aula.horario}` : ""}
            </span>
          </div>
        </div>
        <span className="rotulo-mono shrink-0 pt-1 text-right text-[9px]">Próximo encontro</span>
      </div>

      <div className="min-w-0 space-y-1.5">
        {aula.tipo_evento && (
          <span className="rotulo-mono block">{NOME_TIPO[aula.tipo_evento] ?? "Encontro"}</span>
        )}
        <p className="text-sm font-medium leading-snug text-foreground md:text-base">{aula.tema}</p>
        {aula.descricao && (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {aula.descricao}
          </p>
        )}
      </div>

      {aula.link_reuniao && (
        <Button size="pill" className="mt-auto w-full" asChild>
          <a href={aula.link_reuniao} target="_blank" rel="noopener noreferrer">
            Entrar no encontro
          </a>
        </Button>
      )}
    </section>
  );
}
