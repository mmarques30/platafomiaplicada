import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { BarraFiltros, type FiltroSelecao } from "@/components/bibliotecas/BarraFiltros";
import { useCatalogoTrilhas } from "@/hooks/useCatalogoTrilhas";
import { CartaoTrilha } from "./CartaoTrilha";
import { ClassificacaoIcons } from "./ClassificacaoIcons";
import { listaCascata, aoMontar } from "@/lib/motion";

const ORDENS: Record<string, string> = {
  ordem: "Ordem das trilhas",
  andamento: "Em andamento primeiro",
  recentes: "Mais recentes",
  antigos: "Mais antigas",
};

/**
 * O catálogo do Academy. Grade, não carrossel: quem chega aqui quer varrer o
 * que existe e ver de onde continuar, e o carrossel escondia a maior parte
 * atrás de um arrasto lateral.
 *
 * Os filtros eram dois seletores soltos numa linha, sem busca e sem dizer o
 * que estava ligado: para limpar, a pessoa tinha de voltar seletor por
 * seletor. Agora a página usa a mesma barra das bibliotecas — busca, chips do
 * que está ativo com o X de cada um, "limpar tudo" e a contagem à direita.
 * A classificação continua em ícones acima, porque é o filtro principal.
 *
 * Os dados vêm de `useCatalogoTrilhas`, o mesmo hook do painel de abertura,
 * então a página inteira se monta com uma leitura só do catálogo.
 */
export function GradeTrilhas() {
  const { data: trilhas, isLoading, isError } = useCatalogoTrilhas();
  const [busca, setBusca] = useState("");
  const [ordenar, setOrdenar] = useState("ordem");
  const [classificacao, setClassificacao] = useState("todas");
  const [ferramenta, setFerramenta] = useState("todas");

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

    const termo = busca.trim().toLowerCase();
    if (termo) {
      lista = lista.filter(
        (t) =>
          t.titulo.toLowerCase().includes(termo) ||
          t.ferramentas.some((f) => f.toLowerCase().includes(termo)) ||
          (t.classificacao ?? "").toLowerCase().includes(termo),
      );
    }

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
  }, [trilhas, busca, classificacao, ferramenta, ordenar]);

  const filtros: FiltroSelecao[] = [
    {
      chave: "ordem",
      rotuloVazio: "Ordenar",
      rotuloLista: ORDENS.ordem,
      valor: ordenar,
      valorVazio: "ordem",
      opcoes: ["andamento", "recentes", "antigos"],
      aoMudar: setOrdenar,
      formatar: (o) => ORDENS[o] ?? o,
      larguraClasse: "w-[200px]",
    },
  ];

  if (ferramentas.length > 0) {
    filtros.push({
      chave: "ferramenta",
      rotuloVazio: "Ferramenta",
      rotuloLista: "Todas as ferramentas",
      valor: ferramenta,
      valorVazio: "todas",
      opcoes: ferramentas,
      aoMudar: setFerramenta,
    });
  }

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

      <BarraFiltros
        busca={busca}
        aoBuscar={setBusca}
        placeholderBusca="Buscar trilha ou ferramenta..."
        filtros={filtros}
        total={filtradas.length}
        substantivo="trilha"
      />

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
