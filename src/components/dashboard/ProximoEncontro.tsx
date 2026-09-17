import { useMemo } from "react";
import { format, isAfter, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAulasCalendario } from "@/hooks/useCalendarioAulas";
import { Button } from "@/components/ui/button";

const NOME_TIPO: Record<string, string> = {
  aula_ao_vivo: "Aula ao vivo",
  qa: "Sessão de perguntas",
  live_youtube: "Live no YouTube",
  outro: "Encontro",
};

/**
 * O próximo encontro marcado, lido do calendário de aulas. Some quando não há
 * nada agendado com data — aula recorrente sem data não entra aqui.
 */
export function ProximoEncontro() {
  const { data: aulas, isLoading } = useAulasCalendario();

  const proxima = useMemo(() => {
    if (!aulas?.length) return null;
    const hoje = startOfDay(new Date());
    return (
      aulas
        .filter((a) => a.data_aula && !a.realizada && isAfter(parseISO(a.data_aula), hoje))
        .sort((a, b) => parseISO(a.data_aula!).getTime() - parseISO(b.data_aula!).getTime())[0] ?? null
    );
  }, [aulas]);

  if (isLoading) {
    return <div className="h-[196px] animate-skeleton-pulse rounded-card bg-card" />;
  }

  if (!proxima) return null;

  const data = parseISO(proxima.data_aula!);

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-card">
      <span className="rotulo-mono">Próximo encontro</span>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-serif-display text-4xl leading-none text-foreground">
          {format(data, "dd")}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium capitalize text-foreground">
            {format(data, "MMMM", { locale: ptBR })}
          </span>
          <span className="rotulo-mono truncate">
            {format(data, "EEEE", { locale: ptBR })}
            {proxima.horario ? ` · ${proxima.horario}` : ""}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground">{proxima.tema}</p>
      {proxima.descricao && (
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {proxima.descricao}
        </p>
      )}
      {proxima.tipo_evento && (
        <span className="mt-3 inline-flex rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {NOME_TIPO[proxima.tipo_evento] ?? "Encontro"}
        </span>
      )}

      {proxima.link_reuniao && (
        <Button size="pill" className="mt-4 w-full" asChild>
          <a href={proxima.link_reuniao} target="_blank" rel="noopener noreferrer">
            Entrar no encontro
          </a>
        </Button>
      )}
    </section>
  );
}
