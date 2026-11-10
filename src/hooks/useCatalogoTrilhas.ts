import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TrilhaCatalogo {
  id: string;
  titulo: string;
  imagem_url: string | null;
  categoria: string | null;
  classificacao: string | null;
  ferramentas: string[];
  ordem: number;
  visivel_apenas_pro: boolean;
  created_at: string;
  totalVideos: number;
  videosConcluidos: number;
}

export interface ResumoCatalogo {
  /** Quantas trilhas o catálogo tem. */
  trilhas: number;
  /** Quantas já foram abertas e não terminadas. */
  emAndamento: number;
  /** Quantas estão em 100%. */
  concluidas: number;
  /** Aulas concluídas e aulas que existem, somando o catálogo. */
  aulasConcluidas: number;
  aulasTotais: number;
  /** O quanto do catálogo já foi assistido, de 0 a 100. */
  percentual: number;
}

const SELECT_BASE =
  "id, titulo, imagem_url, categoria, classificacao, ordem, visivel_apenas_pro, created_at";

/** A coluna `ferramentas` não existe em todos os ambientes; daí o fallback. */
function faltaColunaFerramentas(erro: { code?: string; message?: string } | null) {
  return (
    erro?.code === "42703" ||
    (erro?.message?.includes("ferramentas") && erro?.message?.includes("does not exist")) ||
    false
  );
}

/**
 * O catálogo de trilhas com o progresso da pessoa cruzado.
 *
 * A consulta vivia dentro da grade. Agora o painel de abertura da página
 * precisa dos mesmos números — total de trilhas, quantas andam, quantas
 * fecharam, quantas aulas de quantas — e repetir a consulta ali seria pedir
 * três requisições a mais para contar o que a grade já tinha contado.
 *
 * Por isso ela mora aqui, atrás da mesma `queryKey` de antes: a grade e o
 * painel chamam este hook, e o TanStack entrega a mesma resposta para os
 * dois, sem segunda ida ao servidor.
 *
 * São três consultas, independentes da quantidade de trilhas: as trilhas, os
 * vídeos ativos e o que a pessoa já concluiu.
 */
export function useCatalogoTrilhas() {
  const { user } = useAuth();

  const consulta = useQuery({
    queryKey: ["grade-trilhas", user?.id],
    queryFn: async (): Promise<TrilhaCatalogo[]> => {
      const completa = await supabase
        .from("trilhas")
        .select(`${SELECT_BASE}, ferramentas`)
        .eq("visivel_mentorados", true)
        .order("ordem");

      let linhas: Array<Record<string, unknown>>;
      if (completa.error && faltaColunaFerramentas(completa.error)) {
        const simples = await supabase
          .from("trilhas")
          .select(SELECT_BASE)
          .eq("visivel_mentorados", true)
          .order("ordem");
        if (simples.error) throw simples.error;
        linhas = (simples.data ?? []) as unknown as Array<Record<string, unknown>>;
      } else {
        if (completa.error) throw completa.error;
        linhas = (completa.data ?? []) as unknown as Array<Record<string, unknown>>;
      }

      const ids = linhas.map((t) => t.id as string);
      if (ids.length === 0) return [];

      const [videos, concluidos] = await Promise.all([
        supabase.from("videos").select("id, trilha_id").eq("ativo", true).in("trilha_id", ids),
        user?.id
          ? supabase
              .from("progresso_videos")
              .select("video_id")
              .eq("user_id", user.id)
              .eq("completado", true)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (videos.error) throw videos.error;

      const vistos = new Set((concluidos.data ?? []).map((p) => p.video_id as string));
      const total: Record<string, number> = {};
      const feitos: Record<string, number> = {};
      (videos.data ?? []).forEach((v) => {
        const t = v.trilha_id as string | null;
        if (!t) return;
        total[t] = (total[t] ?? 0) + 1;
        if (vistos.has(v.id as string)) feitos[t] = (feitos[t] ?? 0) + 1;
      });

      return linhas.map((t) => {
        const id = t.id as string;
        return {
          ...(t as unknown as Omit<
            TrilhaCatalogo,
            "ferramentas" | "totalVideos" | "videosConcluidos"
          >),
          ferramentas: Array.isArray(t.ferramentas) ? (t.ferramentas as string[]) : [],
          totalVideos: total[id] ?? 0,
          videosConcluidos: feitos[id] ?? 0,
        };
      });
    },
  });

  const resumo = useMemo<ResumoCatalogo | null>(() => {
    const lista = consulta.data;
    if (!lista || lista.length === 0) return null;

    let emAndamento = 0;
    let concluidas = 0;
    let aulasConcluidas = 0;
    let aulasTotais = 0;

    for (const t of lista) {
      aulasConcluidas += t.videosConcluidos;
      aulasTotais += t.totalVideos;
      if (t.totalVideos > 0 && t.videosConcluidos >= t.totalVideos) concluidas += 1;
      else if (t.videosConcluidos > 0) emAndamento += 1;
    }

    return {
      trilhas: lista.length,
      emAndamento,
      concluidas,
      aulasConcluidas,
      aulasTotais,
      percentual: aulasTotais > 0 ? Math.round((aulasConcluidas / aulasTotais) * 100) : 0,
    };
  }, [consulta.data]);

  return { ...consulta, resumo };
}
