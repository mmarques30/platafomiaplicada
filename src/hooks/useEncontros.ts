import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { AulaSemanal } from "@/hooks/useCalendarioAulas";

export interface EncontroSpeaker {
  id: string;
  aula_id: string;
  nome: string;
  papel: string | null;
  empresa: string | null;
  bio: string | null;
  foto_url: string | null;
  ordem: number;
}

export interface EncontroMaterial {
  id: string;
  aula_id: string;
  titulo: string;
  descricao: string | null;
  tipo: "link" | "slide" | "planilha" | "documento" | "video" | "outro";
  url: string;
  ordem: number;
}

export interface Encontro extends AulaSemanal {
  gravacao_url: string | null;
  resumo: string | null;
  speakers: EncontroSpeaker[];
  materiais: EncontroMaterial[];
}

/**
 * Os encontros Insider, com quem fala e o material de cada um.
 *
 * A fonte é `aulas_semanais`, a mesma que o painel lê para mostrar o próximo
 * encontro. Speakers e materiais vivem em tabelas filhas e são costurados
 * aqui, em três consultas, em vez de um embed: o `types.ts` gerado ainda não
 * conhece as tabelas novas, e juntar no cliente deixa explícito que um
 * encontro pode existir sem nenhum dos dois.
 *
 * Encontros recorrentes sem data marcada ficam de fora: eles são a régua da
 * agenda semanal, não um evento que a pessoa possa abrir.
 */
export function useEncontros() {
  return useQuery({
    queryKey: ["encontros"],
    queryFn: async (): Promise<Encontro[]> => {
      const { data: linhas, error } = await supabase
        .from("aulas_semanais")
        .select("*")
        .eq("ativo", true)
        .not("data_aula", "is", null)
        .order("data_aula", { ascending: false });

      if (error) throw error;

      const aulas = (linhas ?? []) as unknown as (AulaSemanal & {
        gravacao_url: string | null;
        resumo: string | null;
      })[];
      if (aulas.length === 0) return [];

      const ids = aulas.map((a) => a.id);

      const [{ data: linhasSpeaker }, { data: linhasMaterial }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("encontro_speakers")
          .select("*")
          .in("aula_id", ids)
          .order("ordem", { ascending: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("encontro_materiais")
          .select("*")
          .in("aula_id", ids)
          .order("ordem", { ascending: true }),
      ]);

      const porAula = <T extends { aula_id: string }>(linhas: T[] | null) => {
        const mapa = new Map<string, T[]>();
        for (const linha of linhas ?? []) {
          const atuais = mapa.get(linha.aula_id) ?? [];
          atuais.push(linha);
          mapa.set(linha.aula_id, atuais);
        }
        return mapa;
      };

      const speakers = porAula((linhasSpeaker ?? []) as EncontroSpeaker[]);
      const materiais = porAula((linhasMaterial ?? []) as EncontroMaterial[]);

      return aulas.map((aula) => ({
        ...aula,
        speakers: speakers.get(aula.id) ?? [],
        materiais: materiais.get(aula.id) ?? [],
      }));
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

/** Separa a agenda do histórico, pela data e pelo "já aconteceu". */
export function separarEncontros(encontros: Encontro[]) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const agendados: Encontro[] = [];
  const realizados: Encontro[] = [];

  for (const encontro of encontros) {
    const data = encontro.data_aula ? new Date(`${encontro.data_aula}T00:00:00`) : null;
    const jaPassou = encontro.realizada || (data !== null && data < hoje);
    if (jaPassou) realizados.push(encontro);
    else agendados.push(encontro);
  }

  // A agenda lê do mais próximo para o mais distante; o histórico, ao contrário.
  agendados.sort((a, b) => (a.data_aula ?? "").localeCompare(b.data_aula ?? ""));

  return { agendados, realizados };
}
