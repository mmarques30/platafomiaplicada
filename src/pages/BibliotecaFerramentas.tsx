import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useFerramentasIA } from "@/hooks/useFerramentas";
import { Wrench, Search } from "lucide-react";
import { FerramentaCard } from "@/components/bibliotecas/FerramentaCard";
import {
  FiltrosAvancadosSheet,
  FiltrosAvancados,
} from "@/components/bibliotecas/FiltrosAvancadosSheet";

export default function BibliotecaFerramentas() {
  const { data: ferramentas, isLoading } = useFerramentasIA();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [filtrosAvancados, setFiltrosAvancados] = useState<FiltrosAvancados>({
    categoria: null,
    preco: "todas",
    valeAPena: "todas",
  });

  const categorias = useMemo(
    () => (ferramentas ? Array.from(new Set(ferramentas.map((f) => f.categoria))) : []),
    [ferramentas]
  );

  // Sincronizar categoria selecionada com filtros avançados
  const handleCategoriaClick = (categoria: string | null) => {
    setSelectedCategoria(categoria);
    setFiltrosAvancados((prev) => ({ ...prev, categoria }));
  };

  const handleFiltrosChange = (novosFiltros: FiltrosAvancados) => {
    setFiltrosAvancados(novosFiltros);
    setSelectedCategoria(novosFiltros.categoria);
  };

  const filteredFerramentas = useMemo(() => {
    return ferramentas?.filter((ferramenta) => {
      // Busca por texto
      const matchesSearch =
        ferramenta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ferramenta.objetivo.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de categoria (sincronizado com badges e filtro avançado)
      const matchesCategoria =
        !filtrosAvancados.categoria || ferramenta.categoria === filtrosAvancados.categoria;

      // Filtro de preço
      const matchesPreco =
        filtrosAvancados.preco === "todas" ||
        (filtrosAvancados.preco === "gratuitas" && ferramenta.gratuito) ||
        (filtrosAvancados.preco === "pagas" && !ferramenta.gratuito);

      // Filtro "Vale a pena"
      const matchesValeAPena =
        filtrosAvancados.valeAPena === "todas" ||
        (filtrosAvancados.valeAPena === "sim" && ferramenta.vale_a_pena === true) ||
        (filtrosAvancados.valeAPena === "nao" && ferramenta.vale_a_pena === false);

      return matchesSearch && matchesCategoria && matchesPreco && matchesValeAPena;
    });
  }, [ferramentas, searchTerm, filtrosAvancados]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Ferramentas</h1>
          <p className="text-muted-foreground">
            Catálogo completo de ferramentas de IA com avaliações
          </p>
        </div>
      </div>

      {/* Barra de Busca + Filtro Avançado */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar ferramentas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <FiltrosAvancadosSheet
          filtros={filtrosAvancados}
          onFiltrosChange={handleFiltrosChange}
          categorias={categorias}
        />
      </div>

      {/* Filtros de Categoria (Badges Horizontais) */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant={selectedCategoria === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleCategoriaClick(null)}
        >
          Todas
        </Badge>
        {categorias.map((categoria) => (
          <Badge
            key={categoria}
            variant={selectedCategoria === categoria ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleCategoriaClick(categoria)}
          >
            {categoria}
          </Badge>
        ))}
      </div>

      {/* Contador de Resultados */}
      {filteredFerramentas && (
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredFerramentas.length} de {ferramentas?.length || 0}{" "}
          {filteredFerramentas.length === 1 ? "ferramenta" : "ferramentas"}
        </p>
      )}

      {/* Grid de Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-[280px]">
              <CardContent className="p-4 flex flex-col gap-3">
                <Skeleton className="h-16 w-16 rounded-xl mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full mt-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFerramentas && filteredFerramentas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFerramentas.map((ferramenta) => (
            <FerramentaCard key={ferramenta.id} ferramenta={ferramenta} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma ferramenta encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
