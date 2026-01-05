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
import { Sparkles, Search } from "lucide-react";
import { PageTitle } from "@/components/shared/PageTitle";

const ITEMS_PER_PAGE = 12;

export default function IACopieUse() {
  const { data: ias, isLoading } = useIACopieUse();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedIA, setSelectedIA] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

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
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-6 md:mb-8">
        <PageTitle primary="IA" secondary="Copie e Use" />
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

      {/* Results counter */}
      {filteredIAs && (
        <p className="text-sm text-muted-foreground">
          {filteredIAs.length} {filteredIAs.length === 1 ? 'resultado' : 'resultados'} encontrados
        </p>
      )}

      {isLoading ? (
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
      ) : visibleIAs && visibleIAs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {visibleIAs.map((ia) => (
              <IACopieUseCard
                key={ia.id}
                ia={ia}
                onClick={() => setSelectedIA(ia)}
              />
            ))}
          </div>
          
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
    </div>
  );
}
