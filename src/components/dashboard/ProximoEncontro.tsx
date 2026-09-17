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
 * Faixa larga, no fluxo da página. Era um cartão estreito numa coluna à
 * direita, e essa coluna deixava um vazio grande sempre que o conteúdo da
 * esquerda era mais alto.
 */
export function ProximoEncontro() {
  const { aula, isLoading } = useProximoEncontro();

  if (isLoading) {
    return <div className="h-[92px] animate-skeleton-pulse rounded-card bg-card" />;
  }

  if (!aula) return null;

  const data = parseISO(aula.data_aula!);

  return (
    <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center md:p-5">
      {/* Data */}
      <div className="flex items-baseline gap-3 sm:min-w-[150px] sm:flex-col sm:items-start sm:gap-0.5 sm:border-r sm:border-border sm:pr-5">
        <span className="font-serif-display text-4xl leading-none text-foreground">
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

      {/* Tema */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rotulo-mono">Próximo encontro</span>
          {aula.tipo_evento && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="rotulo-mono">{NOME_TIPO[aula.tipo_evento] ?? "Encontro"}</span>
            </>
          )}
        </div>
        <p className="text-sm font-medium leading-snug text-foreground md:text-base">{aula.tema}</p>
        {aula.descricao && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
            {aula.descricao}
          </p>
        )}
      </div>

      {aula.link_reuniao && (
        <Button size="pill" className="w-full shrink-0 sm:w-auto" asChild>
          <a href={aula.link_reuniao} target="_blank" rel="noopener noreferrer">
            Entrar no encontro
          </a>
        </Button>
      )}
    </section>
  );
}
