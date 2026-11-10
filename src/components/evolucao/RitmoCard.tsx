import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarrasMarca, CartaoGrafico, ChipVariacao } from "@/components/graficos";
import { Skeleton } from "@/components/ui/skeleton";

/** A chave ISO da semana, para agrupar sem depender do fuso. */
function chaveDaSemana(data: Date): string {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const inicioDoAno = new Date(d.getFullYear(), 0, 4);
  const semana =
    1 +
    Math.round(
      ((d.getTime() - inicioDoAno.getTime()) / 86400000 - 3 + ((inicioDoAno.getDay() + 6) % 7)) / 7,
    );
  return `${d.getFullYear()}-W${semana}`;
}

/** O dia em que a semana começa, para escrever "13/10" no eixo. */
function segundaDaSemana(data: Date): Date {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/**
 * O ritmo das últimas oito semanas.
 *
 * Este componente já agrupava as aulas por semana e já calculava a variação
 * contra a média — e jogava tudo fora, mostrando só um número e uma etiqueta
 * dizendo "12% acima do seu ritmo médio". A série estava ali, calculada, e
 * ninguém a via.
 *
 * Agora ela é o gráfico. Oito barras, uma por semana, a da semana corrente em
 * destaque, com o número e o chip de variação acima. O mesmo dado responde
 * "quanto" e "como chegou até aqui", que é o que uma página chamada Meu
 * progresso precisa responder.
 *
 * A regra de não mostrar nada com menos de três semanas de dados continua: um
 * gráfico de duas barras não é uma tendência, é um par de números.
 */
export function RitmoCard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["ritmo-semanal", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const oitoSemanasAtras = new Date();
      oitoSemanasAtras.setDate(oitoSemanasAtras.getDate() - 56);

      const { data } = await supabase
        .from("progresso_videos")
        .select("id, created_at")
        .eq("user_id", user!.id)
        .eq("completado", true)
        .gte("created_at", oitoSemanasAtras.toISOString())
        .order("created_at", { ascending: false });

      return data ?? [];
    },
  });

  const ritmo = useMemo(() => {
    if (!data || data.length === 0) return null;

    const porSemana = new Map<string, number>();
    for (const item of data) {
      if (!item.created_at) continue;
      const chave = chaveDaSemana(new Date(item.created_at));
      porSemana.set(chave, (porSemana.get(chave) ?? 0) + 1);
    }

    // Oito baldes, do mais antigo para o mais recente, incluindo os vazios.
    const agora = new Date();
    const semanas: Array<{ nome: string; valor: number; destaque?: boolean }> = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(agora);
      d.setDate(d.getDate() - i * 7);
      const inicio = segundaDaSemana(d);
      semanas.push({
        nome: `${String(inicio.getDate()).padStart(2, "0")}/${String(inicio.getMonth() + 1).padStart(2, "0")}`,
        valor: porSemana.get(chaveDaSemana(d)) ?? 0,
        destaque: i === 0,
      });
    }

    const comDados = semanas.filter((s) => s.valor > 0);
    if (comDados.length < 3) return null;

    const recentes = semanas.slice(-2);
    const historico = semanas.slice(0, -2);
    const mediaAtual = recentes.reduce((soma, s) => soma + s.valor, 0) / recentes.length;
    const mediaBase =
      historico.length > 0
        ? historico.reduce((soma, s) => soma + s.valor, 0) / historico.length
        : 0;
    const variacao = mediaBase > 0 ? ((mediaAtual - mediaBase) / mediaBase) * 100 : null;

    return {
      semanas,
      mediaAtual: Math.round(mediaAtual * 10) / 10,
      variacao,
    };
  }, [data]);

  if (isLoading) return <Skeleton className="h-[260px] rounded-[20px]" />;

  // Sem três semanas de dados não há tendência para desenhar. Antes o
  // componente sumia, e a célula larga da grade virava um buraco com o bloco
  // de atalhos boiando sozinho à direita. Agora ele ocupa o lugar e explica
  // o que falta para o gráfico existir.
  if (!ritmo) {
    return (
      <div className="h-[260px]">
        <CartaoGrafico titulo="Seu ritmo, semana a semana">
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não dá para desenhar uma tendência.
            </p>
            <p className="max-w-xs text-xs text-muted-foreground/70">
              Conclua aulas em três semanas diferentes e este gráfico passa a mostrar seu ritmo.
            </p>
          </div>
        </CartaoGrafico>
      </div>
    );
  }

  const leitura =
    ritmo.variacao === null
      ? `Média de ${ritmo.mediaAtual} aulas por semana.`
      : ritmo.variacao > 15
        ? `Você está ${Math.round(ritmo.variacao)}% acima do seu ritmo médio.`
        : ritmo.variacao < -15
          ? `Você está ${Math.abs(Math.round(ritmo.variacao))}% abaixo do seu ritmo médio.`
          : "Seu ritmo está estável.";

  return (
    <div className="h-[260px]">
      <CartaoGrafico
        titulo="Seu ritmo, semana a semana"
        leitura={leitura}
        acao={
          <div className="text-right">
            <span className="numero-painel block text-xl text-foreground">{ritmo.mediaAtual}</span>
            <span className="rotulo-mono text-[9px]">aulas/semana</span>
          </div>
        }
      >
        <div className="flex h-full flex-col">
          <div className="mb-2 flex justify-end">
            <ChipVariacao valor={ritmo.variacao} />
          </div>
          <div className="min-h-0 flex-1">
            <BarrasMarca dados={ritmo.semanas} formatar={(v) => String(Math.round(v))} />
          </div>
        </div>
      </CartaoGrafico>
    </div>
  );
}
