import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIACopieUse } from "@/hooks/useFerramentas";
import { IACopieUseCard } from "@/components/bibliotecas/IACopieUseCard";
import { IACopieUseDetalhesModal } from "@/components/bibliotecas/IACopieUseDetalhesModal";
import { Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IACopieUseRow } from "@/components/bibliotecas/IACopieUseRow";
import { BarraFiltros } from "@/components/bibliotecas/BarraFiltros";
import { ListaRecursos } from "@/components/bibliotecas/LinhaRecurso";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";

const ITEMS_PER_PAGE = 12;

export default function IACopieUse() {
  const { data: ias, isLoading } = useIACopieUse();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedIA, setSelectedIA] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [viewMode, setViewMode] = useState<"cards" | "tabela">("cards");

  const categorias = ias
    ? Array.from(new Set(ias.map((ia) => ia.categoria)))
    : [];

  const filteredIAs = ias?.filter((ia) => {
    const matchesSearch = ia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ia.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || ia.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  const visibleIAs = filteredIAs?.slice(0, visibleCount);
  const hasMore = filteredIAs && filteredIAs.length > visibleCount;
  const remaining = filteredIAs ? filteredIAs.length - visibleCount : 0;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <PageContainer>
      <div className="mb-6 md:mb-8">
        <PageTitle
          primary="Modelos"
          secondary="prontos"
          description="Fluxos de IA que já rodam em operações reais, prontos para copiar, trocar pelos seus dados e colocar para funcionar hoje."
        />
      </div>

      <BarraFiltros
        busca={searchTerm}
        aoBuscar={(v) => {
          setSearchTerm(v);
          setVisibleCount(ITEMS_PER_PAGE);
        }}
        placeholderBusca="Buscar modelos"
        total={filteredIAs?.length}
        substantivo="modelo"
        filtros={[
          {
            chave: "categoria",
            rotuloVazio: "Categoria",
            rotuloLista: "Todas as categorias",
            valor: selectedCategoria ?? "todas",
            valorVazio: "todas",
            opcoes: categorias,
            aoMudar: (valor) => {
              setSelectedCategoria(valor === "todas" ? null : valor);
              setVisibleCount(ITEMS_PER_PAGE);
            },
          },
        ]}
        acoes={
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "cards" | "tabela")}>
            <TabsList className="h-10">
              <TabsTrigger value="cards">Cartões</TabsTrigger>
              <TabsTrigger value="tabela">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {isLoading ? (
        viewMode === "cards" ? (
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="min-h-[220px]">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2 mt-auto">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 border-b border-border last:border-b-0">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
                <Skeleton className="h-5 w-20 hidden lg:block" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </Card>
        )
      ) : visibleIAs && visibleIAs.length > 0 ? (
        <>
          {viewMode === "cards" ? (
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visibleIAs.map((ia) => (
                <IACopieUseCard
                  key={ia.id}
                  ia={ia}
                  onClick={() => setSelectedIA(ia)}
                />
              ))}
            </div>
          ) : (
            <ListaRecursos>
              {visibleIAs.map((ia) => (
                <IACopieUseRow key={ia.id} ia={ia} onClick={() => setSelectedIA(ia)} />
              ))}
            </ListaRecursos>
          )}
          
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleShowMore}
              >
                Ver mais ({remaining} restantes)
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma ferramenta encontrada
            </p>
          </CardContent>
        </Card>
      )}

      <IACopieUseDetalhesModal
        ia={selectedIA}
        open={!!selectedIA}
        onOpenChange={(open) => !open && setSelectedIA(null)}
      />
    </PageContainer>
  );
}
