import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ConteudoDashboard } from "@/hooks/useConteudosDashboard";

// Ids já tentados nesta aba do navegador: evita bater na função a cada render
// ou a cada visita para conteúdos cujo site não expõe imagem.
const STORAGE_KEY = "capas_conteudo_tentadas";

function lerTentadas(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function salvarTentadas(ids: Set<string>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* sem storage: segue sem cache */
  }
}

/**
 * Para conteúdos sem imagem de capa mas com link, pede à edge function
 * `capa-conteudo` que descubra a imagem da notícia (og:image) e grave no
 * banco. Ao terminar, invalida a query para os cards trocarem o resumo pela
 * imagem.
 */
export function useCapasConteudo(conteudos: ConteudoDashboard[] | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conteudos || conteudos.length === 0) return;
    const tentadas = lerTentadas();
    const pendentes = conteudos
      .filter((c) => !c.imagem_url && c.link_externo && !tentadas.has(c.id))
      .map((c) => c.id)
      .slice(0, 10);
    if (pendentes.length === 0) return;

    pendentes.forEach((id) => tentadas.add(id));
    salvarTentadas(tentadas);

    let cancelado = false;
    supabase.functions
      .invoke("capa-conteudo", { body: { ids: pendentes } })
      .then(({ data, error }) => {
        if (cancelado || error) return;
        const capas = (data?.capas || {}) as Record<string, string | null>;
        if (Object.values(capas).some(Boolean)) {
          queryClient.invalidateQueries({ queryKey: ["conteudos-dashboard"] });
        }
      })
      .catch(() => {
        /* sem capa: o card mostra o resumo */
      });

    return () => {
      cancelado = true;
    };
  }, [conteudos, queryClient]);
}
