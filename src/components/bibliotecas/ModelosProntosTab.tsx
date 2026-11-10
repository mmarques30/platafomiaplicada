import { useCallback, useState } from "react";

import type { Database } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIACopieUse, useFerramentasIA } from "@/hooks/useFerramentas";
import { IACopieUseCard } from "@/components/bibliotecas/IACopieUseCard";
import { FERRAMENTA_INFO, normalizarFerramenta } from "@/lib/metodosCategories";
import { IACopieUseRow } from "@/components/bibliotecas/IACopieUseRow";
import { IACopieUseDetalhesModal } from "@/components/bibliotecas/IACopieUseDetalhesModal";
import { BarraFiltros } from "@/components/bibliotecas/BarraFiltros";
import { ListaRecursos } from "@/components/bibliotecas/LinhaRecurso";

type ModeloPronto = Database["public"]["Tables"]["ia_copie_use"]["Row"];

/**
 * `ferramentas_recomendadas` é uma coluna JSON: pode vir lista, pode vir
 * string, pode vir nulo. O modal espera uma lista de textos, e a página
 * antiga escondia essa diferença passando o registro como `any`. Aqui ela é
 * resolvida na fronteira, uma vez só.
 */
function comoLista(valor: unknown): string[] | null {
  if (Array.isArray(valor)) return valor.filter((v): v is string => typeof v === "string");
  if (typeof valor === "string" && valor.trim()) return [valor];
  return null;
}

const POR_PAGINA = 12;

/**
 * Os modelos prontos.
 *
 * Eram uma página só deles, irmã de Métodos práticos no menu Materiais. As
 * duas respondem à mesma pergunta — "me dá o material pronto para eu aplicar
 * hoje" — e a pessoa tinha de adivinhar em qual das duas o que ela procura
 * foi parar. Agora os modelos são a quarta aba de Métodos práticos, ao lado
 * de Skills, Biblioteca e Materiais, e o menu Materiais fica com três itens
 * em vez de quatro.
 *
 * O conteúdo é o mesmo da página antiga: busca, filtro de categoria, as duas
 * visões (cartões e lista), o "ver mais" e o modal de detalhes.
 */
export function ModelosProntosTab() {
  const { data: ias, isLoading } = useIACopieUse();
  const { data: ferramentasIA } = useFerramentasIA();

  /*
   * O logo da ferramenta do modelo: primeiro o cadastro da Biblioteca de
   * Ferramentas, depois o logo local do arsenal, e o ToolLogo ainda tem o
   * favicon do site oficial como último degrau. É a mesma cadeia que
   * Métodos práticos já usava nas skills.
   */
  const logoDe = useCallback(
    (nome: string) => {
      const alvo = normalizarFerramenta(nome) ?? nome;
      const daBase = (ferramentasIA || []).find(
        (f: { nome: string }) => (normalizarFerramenta(f.nome) ?? f.nome) === alvo,
      ) as { logo_url?: string | null; link_ferramenta?: string | null } | undefined;
      const info = FERRAMENTA_INFO[alvo];
      return {
        logoUrl: daBase?.logo_url || info?.logo || null,
        linkFerramenta: daBase?.link_ferramenta || info?.link || null,
      };
    },
    [ferramentasIA],
  );
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<ModeloPronto | null>(null);
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [visao, setVisao] = useState<"cards" | "tabela">("cards");

  const categorias = ias ? Array.from(new Set(ias.map((ia) => ia.categoria))) : [];

  const filtrados = ias?.filter((ia) => {
    const termo = busca.toLowerCase();
    const casaBusca =
      ia.titulo.toLowerCase().includes(termo) || ia.descricao.toLowerCase().includes(termo);
    const casaCategoria = !categoria || ia.categoria === categoria;
    return casaBusca && casaCategoria;
  });

  const naTela = filtrados?.slice(0, visiveis);
  const temMais = filtrados && filtrados.length > visiveis;
  const faltam = filtrados ? filtrados.length - visiveis : 0;

  return (
    <div className="space-y-6">
      <BarraFiltros
        busca={busca}
        aoBuscar={(v) => {
          setBusca(v);
          setVisiveis(POR_PAGINA);
        }}
        placeholderBusca="Buscar modelos"
        total={filtrados?.length}
        substantivo="modelo"
        filtros={[
          {
            chave: "categoria",
            rotuloVazio: "Categoria",
            rotuloLista: "Todas as categorias",
            valor: categoria ?? "todas",
            valorVazio: "todas",
            opcoes: categorias,
            aoMudar: (valor) => {
              setCategoria(valor === "todas" ? null : valor);
              setVisiveis(POR_PAGINA);
            },
          },
        ]}
        acoes={
          <Tabs value={visao} onValueChange={(v) => setVisao(v as "cards" | "tabela")}>
            <TabsList className="h-10">
              <TabsTrigger value="cards">Cartões</TabsTrigger>
              <TabsTrigger value="tabela">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {isLoading ? (
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="superficie space-y-3 p-5">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : naTela && naTela.length > 0 ? (
        <>
          {visao === "cards" ? (
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {naTela.map((ia) => (
                <IACopieUseCard key={ia.id} ia={ia} logoDe={logoDe} onClick={() => setSelecionado(ia)} />
              ))}
            </div>
          ) : (
            <ListaRecursos>
              {naTela.map((ia) => (
                <IACopieUseRow key={ia.id} ia={ia} onClick={() => setSelecionado(ia)} />
              ))}
            </ListaRecursos>
          )}

          {temMais && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setVisiveis((n) => n + POR_PAGINA)}>
                Ver mais ({faltam} restantes)
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="rounded-card border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Nenhum modelo com esses filtros.
        </p>
      )}

      <IACopieUseDetalhesModal
        ia={
          selecionado
            ? {
                ...selecionado,
                ferramentas_recomendadas: comoLista(selecionado.ferramentas_recomendadas),
              }
            : null
        }
        open={!!selecionado}
        onOpenChange={(aberto) => !aberto && setSelecionado(null)}
      />
    </div>
  );
}
