import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartaoTrilha } from "./CartaoTrilha";
import { ClassificacaoIcons } from "./ClassificacaoIcons";
import { listaCascata, aoMontar } from "@/lib/motion";

interface Trilha {
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
 * O catálogo do Academy. Grade, não carrossel: quem chega aqui quer varrer o
 * que existe e ver de onde continuar, e o carrossel escondia a maior parte
 * atrás de um arrasto lateral.
 *
 * São três consultas, independentes da quantidade de trilhas: as trilhas, os
 * vídeos ativos e o que a pessoa já concluiu. O progresso é cruzado aqui.
 */
export function GradeTrilhas() {
  const { user } = useAuth();
  const [ordenar, setOrdenar] = useState("ordem");
  const [classificacao, setClassificacao] = useState("todas");
  const [ferramenta, setFerramenta] = useState("todas");

  const { data: trilhas, isLoading, isError } = useQuery({
    queryKey: ["grade-trilhas", user?.id],
    queryFn: async (): Promise<Trilha[]> => {
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
          ...(t as unknown as Omit<Trilha, "ferramentas" | "totalVideos" | "videosConcluidos">),
          ferramentas: Array.isArray(t.ferramentas) ? (t.ferramentas as string[]) : [],
          totalVideos: total[id] ?? 0,
          videosConcluidos: feitos[id] ?? 0,
        };
      });
    },
  });

  const classificacoes = useMemo(() => {
    const cls = new Set((trilhas ?? []).map((t) => t.classificacao).filter(Boolean) as string[]);
    return Array.from(cls).sort();
  }, [trilhas]);

  const ferramentas = useMemo(() => {
    const set = new Set<string>();
    (trilhas ?? []).forEach((t) => t.ferramentas.forEach((f) => f && set.add(f)));
    return Array.from(set).sort();
  }, [trilhas]);

  const filtradas = useMemo(() => {
    let lista = [...(trilhas ?? [])];
    if (classificacao !== "todas") lista = lista.filter((t) => t.classificacao === classificacao);
    if (ferramenta !== "todas") lista = lista.filter((t) => t.ferramentas.includes(ferramenta));

    switch (ordenar) {
      case "recentes":
        lista.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "antigos":
        lista.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "andamento":
        lista.sort((a, b) => {
          const pa = a.totalVideos ? a.videosConcluidos / a.totalVideos : 0;
          const pb = b.totalVideos ? b.videosConcluidos / b.totalVideos : 0;
          const emAndamento = (p: number) => (p > 0 && p < 1 ? 0 : p === 0 ? 1 : 2);
          return emAndamento(pa) - emAndamento(pb) || a.ordem - b.ordem;
        });
        break;
      default:
        lista.sort((a, b) => a.ordem - b.ordem);
    }
    return lista;
  }, [trilhas, classificacao, ferramenta, ordenar]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-[340px] animate-skeleton-pulse rounded-card bg-card" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-card border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        Não foi possível carregar as trilhas. Tente atualizar a página.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Classificação em ícones: é o filtro principal, então fica no topo. */}
      {classificacoes.length > 0 && (
        <ClassificacaoIcons
          classificacoes={classificacoes}
          activeFilter={classificacao}
          onSelect={setClassificacao}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Select value={ordenar} onValueChange={setOrdenar}>
          <SelectTrigger className="h-10 w-auto min-w-[170px] rounded-full">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ordem">Ordem das trilhas</SelectItem>
            <SelectItem value="andamento">Em andamento primeiro</SelectItem>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="antigos">Mais antigas</SelectItem>
          </SelectContent>
        </Select>

        {ferramentas.length > 0 && (
          <Select value={ferramenta} onValueChange={setFerramenta}>
            <SelectTrigger className="h-10 w-auto min-w-[170px] rounded-full">
              <SelectValue placeholder="Ferramenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as ferramentas</SelectItem>
              {ferramentas.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <span className="rotulo-mono ml-auto">
          {filtradas.length} {filtradas.length === 1 ? "trilha" : "trilhas"}
        </span>
      </div>

      {filtradas.length === 0 ? (
        <p className="rounded-card border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Nenhuma trilha com esses filtros.
        </p>
      ) : (
        <motion.div
          variants={listaCascata}
          {...aoMontar}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {filtradas.map((t) => (
            <CartaoTrilha
              key={t.id}
              id={t.id}
              titulo={t.titulo}
              ordem={t.ordem}
              imagemUrl={t.imagem_url}
              classificacao={t.classificacao}
              ferramentas={t.ferramentas}
              totalVideos={t.totalVideos}
              videosConcluidos={t.videosConcluidos}
              apenasPro={t.visivel_apenas_pro}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
