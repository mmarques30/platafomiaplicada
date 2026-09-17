import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Sparkles, Search, LayoutGrid, List } from "lucide-react";
import { IACopieUseRow } from "@/components/bibliotecas/IACopieUseRow";
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
        <PageTitle primary="Modelos" secondary="prontos" eyebrow="Recursos" />
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Ferramentas de IA prontas para você copiar e usar
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar ferramentas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCategoria || "todas"}
          onValueChange={(value) => {
            setSelectedCategoria(value === "todas" ? null : value);
            setVisibleCount(ITEMS_PER_PAGE);
          }}
        >
          <SelectTrigger className="w-full sm:w-[220px] shrink-0">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results counter + view toggle */}
      {filteredIAs && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredIAs.length} {filteredIAs.length === 1 ? 'resultado' : 'resultados'} encontrados
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "tabela" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("tabela")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {visibleIAs.map((ia) => (
                <IACopieUseCard
                  key={ia.id}
                  ia={ia}
                  onClick={() => setSelectedIA(ia)}
                />
              ))}
            </div>
          ) : (
            <Card>
              {visibleIAs.map((ia) => (
                <IACopieUseRow
                  key={ia.id}
                  ia={ia}
                  onClick={() => setSelectedIA(ia)}
                />
              ))}
            </Card>
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
