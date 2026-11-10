import { useMemo } from "react";

import { ToolLogo } from "@/components/shared/ToolLogo";
import { NotaMari } from "./ChipsRecurso";

interface Ferramenta {
  id: string;
  nome: string;
  logo_url: string | null;
  categoria: string;
  avaliacao?: number | null;
  avaliacao_mari: number | null;
  avaliacao_comunidade: number | null;
  total_avaliacoes_comunidade: number | null;
  relevancia_mercado?: number | null;
  recencia_modelo?: number | null;
  gratuito: boolean;
  link_ferramenta: string | null;
  objetivo: string;
  score_ranking?: number;
}

interface FerramentasRankingProps {
  ferramentas: Ferramenta[];
  onVerMais: (ferramenta: Ferramenta) => void;
}

/**
 * O pódio das cinco ferramentas que a Mariana recomenda primeiro.
 *
 * A seleção não mudou: continua curada por nome, com as vagas que
 * sobram preenchidas por score. O que mudou foi o tamanho que ela
 * ocupava.
 *
 * Antes este bloco tomava quase uma tela inteira: um título grande e
 * centralizado, uma doca de cinco ícones flutuantes com número por
 * cima, e abaixo cinco cartões repetindo nome, categoria, objetivo,
 * nota e dois botões — exatamente as mesmas ferramentas que a lista
 * logo abaixo mostrava de novo. A pessoa rolava duas vezes pelo mesmo
 * conteúdo antes de chegar ao catálogo.
 *
 * Agora são cinco colunas de uma faixa só, do tamanho de um cabeçalho:
 * posição, logo, nome e nota. É um atalho para o topo da lista, que é
 * o que um ranking precisa ser quando a lista inteira vem a seguir.
 */
export function FerramentasRanking({ ferramentas, onVerMais }: FerramentasRankingProps) {
  const top5 = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const curado: string[][] = [
      ["claude"],
      ["chatgpt", "gpt"],
      ["manus"],
      ["lovable"],
      ["cursor"],
    ];
    const escolhidas: Ferramenta[] = [];
    for (const aliases of curado) {
      const found = ferramentas.find(
        (f) => !escolhidas.includes(f) && aliases.some((a) => norm(f.nome).includes(a)),
      );
      if (found) escolhidas.push(found);
    }
    const porScore = ferramentas
      .filter((f) => !escolhidas.includes(f))
      .filter(
        (f) =>
          (f.score_ranking || 0) > 0 ||
          (f.avaliacao || 0) > 0 ||
          (f.avaliacao_comunidade || 0) > 0 ||
          (f.relevancia_mercado || 0) > 0 ||
          (f.recencia_modelo || 0) > 0,
      );
    return [...escolhidas, ...porScore].slice(0, 5);
  }, [ferramentas]);

  if (top5.length === 0) return null;

  return (
    <section className="superficie overflow-hidden">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/70 px-5 py-3.5">
        <h2 className="titulo-bloco text-sm text-foreground">As cinco que eu abro primeiro</h2>
        <p className="text-xs text-muted-foreground">
          Por relevância de mercado, modelo mais recente e nota da mentora
        </p>
      </header>

      <ol className="grid grid-cols-1 divide-y divide-border/70 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
        {top5.map((ferramenta, i) => (
          <li key={ferramenta.id}>
            <button
              type="button"
              onClick={() => onVerMais(ferramenta)}
              className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/50"
            >
              <span className="rotulo-mono w-4 shrink-0 text-[11px] text-primary">{i + 1}</span>
              <ToolLogo
                logoUrl={ferramenta.logo_url}
                toolName={ferramenta.nome}
                linkFerramenta={ferramenta.link_ferramenta}
                size="md"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                  {ferramenta.nome}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {ferramenta.categoria}
                </span>
              </span>
              <NotaMari nota={ferramenta.avaliacao_mari} className="shrink-0" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
