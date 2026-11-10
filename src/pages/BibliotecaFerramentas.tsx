import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useFerramentasIA } from "@/hooks/useFerramentas";
import { Wrench } from "lucide-react";
import { FerramentasRanking } from "@/components/bibliotecas/FerramentasRanking";
import { FerramentaCardHorizontal } from "@/components/bibliotecas/FerramentaCardHorizontal";
import { BarraFiltros } from "@/components/bibliotecas/BarraFiltros";
import { ListaRecursos } from "@/components/bibliotecas/LinhaRecurso";
import { FerramentaDetalhesModal } from "@/components/bibliotecas/FerramentaDetalhesModal";
import { TabsContent } from "@/components/ui/tabs";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BibliotecaFerramentas() {
  const { data: ferramentas, isLoading } = useFerramentasIA();
  const [searchTerm, setSearchTerm] = useState("");
  const [ferramentaSelecionada, setFerramentaSelecionada] = useState<any>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroPreco, setFiltroPreco] = useState("todas");
  const [filtroValeAPena, setFiltroValeAPena] = useState("todas");
  const [itemsToShow, setItemsToShow] = useState(10);

  const categorias = useMemo(
    () => (ferramentas ? Array.from(new Set(ferramentas.map((f) => f.categoria))) : []),
    [ferramentas]
  );

  const filteredFerramentas = useMemo(() => {
    return ferramentas?.filter((ferramenta) => {
      // Busca por texto
      const matchesSearch =
        ferramenta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ferramenta.objetivo.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de categoria
      const matchesCategoria =
        filtroCategoria === "todas" || ferramenta.categoria === filtroCategoria;

      // Filtro de preço
      const matchesPreco =
        filtroPreco === "todas" ||
        (filtroPreco === "gratuitas" && ferramenta.gratuito) ||
        (filtroPreco === "pagas" && !ferramenta.gratuito);

      // Filtro "Vale a pena"
      const matchesValeAPena =
        filtroValeAPena === "todas" ||
        (filtroValeAPena === "sim" && ferramenta.vale_a_pena === true) ||
        (filtroValeAPena === "nao" && ferramenta.vale_a_pena === false);

      return matchesSearch && matchesCategoria && matchesPreco && matchesValeAPena;
    });
  }, [ferramentas, searchTerm, filtroCategoria, filtroPreco, filtroValeAPena]);

  const visibleFerramentas = useMemo(() => {
    return filteredFerramentas?.slice(0, itemsToShow) || [];
  }, [filteredFerramentas, itemsToShow]);

  useEffect(() => {
    setItemsToShow(10);
  }, [searchTerm, filtroCategoria, filtroPreco, filtroValeAPena]);

  return (
    <PageContainer>
      {/* Cabeçalho */}
      <PageTitle
        primary="Biblioteca"
        secondary="de ferramentas"
        eyebrow="Recursos"
        description="As ferramentas de IA que eu testei e recomendo, com o que cada uma entrega e se vale a pena."
      />

      {/* Ranking Top 3 */}
      {!isLoading && ferramentas && ferramentas.length > 0 && (
        <FerramentasRanking 
          ferramentas={ferramentas} 
          onVerMais={(f) => setFerramentaSelecionada(f)}
        />
      )}

      {/* Seção de Catálogo Completo */}
      <div className="space-y-4">

        <BarraFiltros
          busca={searchTerm}
          aoBuscar={setSearchTerm}
          placeholderBusca="Buscar ferramentas"
          total={filteredFerramentas?.length}
          substantivo="ferramenta"
          filtros={[
            {
              chave: "categoria",
              rotuloVazio: "Categoria",
              rotuloLista: "Todas as categorias",
              valor: filtroCategoria,
              valorVazio: "todas",
              opcoes: categorias,
              aoMudar: setFiltroCategoria,
            },
            {
              chave: "preco",
              rotuloVazio: "Preço",
              rotuloLista: "Gratuitas e pagas",
              valor: filtroPreco,
              valorVazio: "todas",
              opcoes: ["gratuitas", "pagas"],
              aoMudar: setFiltroPreco,
              formatar: (v) => (v === "gratuitas" ? "Gratuitas" : "Pagas"),
              larguraClasse: "w-[140px]",
            },
            {
              chave: "recomendacao",
              rotuloVazio: "Recomendação",
              rotuloLista: "Todas as recomendações",
              valor: filtroValeAPena,
              valorVazio: "todas",
              opcoes: ["sim", "nao"],
              aoMudar: setFiltroValeAPena,
              formatar: (v) => (v === "sim" ? "Vale a pena" : "Não recomendo"),
              larguraClasse: "w-[180px]",
            },
          ]}
        />

        {/* Conteúdo - Lista */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[92px] rounded-[20px]" />
            ))}
          </div>
        ) : filteredFerramentas && filteredFerramentas.length > 0 ? (
          <>
            <ListaRecursos>
              {visibleFerramentas.map((ferramenta) => (
                <FerramentaCardHorizontal
                  key={ferramenta.id}
                  ferramenta={ferramenta}
                  onVerMais={() => setFerramentaSelecionada(ferramenta)}
                />
              ))}
            </ListaRecursos>

            {/* Botão Ver Mais */}
            {filteredFerramentas && visibleFerramentas.length < filteredFerramentas.length && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setItemsToShow(prev => prev + 10)}
                  className="min-w-[200px]"
                >
                  Ver Mais ({filteredFerramentas.length - visibleFerramentas.length} restantes)
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma ferramenta encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* A contagem vive na barra de filtros, junto de quem a muda. */}

      {/* Modal de Detalhes */}
      <FerramentaDetalhesModal
        ferramenta={ferramentaSelecionada}
        onClose={() => setFerramentaSelecionada(null)}
      />
    </PageContainer>
  );
}
