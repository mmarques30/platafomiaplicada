import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { CelulaCalor } from "@/components/graficos";

const DIAS = 28;

interface LinhaProgresso {
  ultima_visualizacao: string | null;
  completado: boolean | null;
  videos: {
    titulo: string | null;
    modulos: { trilha_id: string | null; trilhas: { titulo: string | null } | null } | null;
  } | null;
}

export interface RitmoEstudo {
  /** Um ponto por dia, do mais antigo ao mais recente. */
  serie: Array<{ dia: string; diaCurto: string; aulas: number }>;
  /** Os últimos 14 dias, só os números, para a faísca do cartão. */
  faisca: number[];
  /** A malha de constância: um quadradinho por dia. */
  celulas: CelulaCalor[];
  /** Variação da última semana contra a anterior, em %. */
  variacaoSemana: number | null;
  /** Aulas assistidas no período. */
  totalPeriodo: number;
  /** Quanto cada trilha representa do que foi concluído. */
  porTrilha: Array<{ nome: string; valor: number }>;
}

const VAZIO: RitmoEstudo = {
  serie: [],
  faisca: [],
  celulas: [],
  variacaoSemana: null,
  totalPeriodo: 0,
  porTrilha: [],
};

/** A data em AAAA-MM-DD no fuso local, que é o que a pessoa chama de "dia". */
function chaveDoDia(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/**
 * O ritmo de estudo das últimas quatro semanas.
 *
 * Tudo aqui sai de `progresso_videos`, que é o único registro com data
 * que a plataforma guarda sobre o aluno. Nada é estimado e nada é
 * inventado: dia sem aula é dia com zero, e conta seca aparece como
 * conta seca. É por isso que o painel pode mostrar a variação da semana
 * sem mentir.
 *
 * Os quatro recortes saem da mesma consulta, de propósito: a série do
 * gráfico, a faísca do cartão, a malha de constância e a divisão por
 * trilha falam do mesmo dado, então precisam fechar entre si.
 */
export function useRitmoEstudo(ativo = true): { dados: RitmoEstudo; isLoading: boolean } {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["ritmo-estudo", user?.id],
    enabled: ativo && !!user?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<LinhaProgresso[]> => {
      const desde = new Date();
      desde.setDate(desde.getDate() - DIAS);
      const { data, error } = await supabase
        .from("progresso_videos")
        .select("ultima_visualizacao, completado, videos(titulo, modulos(trilha_id, trilhas(titulo)))")
        .eq("user_id", user!.id)
        .gte("ultima_visualizacao", desde.toISOString())
        .order("ultima_visualizacao", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as LinhaProgresso[];
    },
  });

  const dados = useMemo<RitmoEstudo>(() => {
    if (!data) return VAZIO;

    // Um balde por dia, mesmo nos dias sem aula: o buraco é informação.
    const porDia = new Map<string, number>();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    for (let i = DIAS - 1; i >= 0; i--) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      porDia.set(chaveDoDia(d), 0);
    }

    const porTrilha = new Map<string, number>();

    for (const linha of data) {
      if (!linha.ultima_visualizacao) continue;
      const d = new Date(linha.ultima_visualizacao);
      d.setHours(0, 0, 0, 0);
      const chave = chaveDoDia(d);
      if (porDia.has(chave)) porDia.set(chave, (porDia.get(chave) ?? 0) + 1);

      if (linha.completado) {
        const titulo = linha.videos?.modulos?.trilhas?.titulo ?? "Sem trilha";
        porTrilha.set(titulo, (porTrilha.get(titulo) ?? 0) + 1);
      }
    }

    const nomesCurtos = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const serie = [...porDia.entries()].map(([chave, aulas]) => {
      const [ano, mes, dia] = chave.split("-").map(Number);
      const d = new Date(ano, mes - 1, dia);
      return {
        dia: `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`,
        diaCurto: nomesCurtos[d.getDay()],
        aulas,
      };
    });

    const numeros = serie.map((p) => p.aulas);
    const ultimos7 = numeros.slice(-7).reduce((a, b) => a + b, 0);
    const anteriores7 = numeros.slice(-14, -7).reduce((a, b) => a + b, 0);
    const variacaoSemana =
      anteriores7 === 0 ? (ultimos7 === 0 ? null : 100) : ((ultimos7 - anteriores7) / anteriores7) * 100;

    const pico = Math.max(1, ...numeros);
    const celulas: CelulaCalor[] = serie.map((ponto) => ({
      chave: ponto.dia,
      rotulo: `${ponto.diaCurto}, ${ponto.dia}`,
      intensidade: ponto.aulas / pico,
      detalhe: ponto.aulas === 0 ? "Nenhuma aula" : `${ponto.aulas} ${ponto.aulas === 1 ? "aula" : "aulas"}`,
    }));

    return {
      serie,
      faisca: numeros.slice(-14),
      celulas,
      variacaoSemana,
      totalPeriodo: numeros.reduce((a, b) => a + b, 0),
      porTrilha: [...porTrilha.entries()]
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5),
    };
  }, [data]);

  return { dados, isLoading };
}
