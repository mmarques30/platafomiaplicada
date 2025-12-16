import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useIACopieUse } from "@/hooks/useFerramentas";
import { IACopieUseRow } from "@/components/bibliotecas/IACopieUseRow";
import { IACopieUseDetalhesModal } from "@/components/bibliotecas/IACopieUseDetalhesModal";
import { Sparkles, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">IA "Copie e Use"</h1>
        <p className="text-muted-foreground">
          Ferramentas de IA prontas para você copiar e usar
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
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
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedCategoria === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => {
              setSelectedCategoria(null);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
          >
            Todas
          </Badge>
          {categorias.map((categoria) => (
            <Badge
              key={categoria}
              variant={selectedCategoria === categoria ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setSelectedCategoria(categoria);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
            >
              {categoria}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results counter */}
      {filteredIAs && (
        <p className="text-sm text-muted-foreground">
          {filteredIAs.length} {filteredIAs.length === 1 ? 'resultado' : 'resultados'} encontrados
        </p>
      )}

      {isLoading ? (
        <Card>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </Card>
      ) : visibleIAs && visibleIAs.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {visibleIAs.map((ia) => (
              <IACopieUseRow
                key={ia.id}
                ia={ia}
                onClick={() => setSelectedIA(ia)}
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="p-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleShowMore}
              >
                Ver mais ({remaining} restantes)
              </Button>
            </div>
          )}
        </Card>
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
