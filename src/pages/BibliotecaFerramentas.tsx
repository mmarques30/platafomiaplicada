import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFerramentasIA } from "@/hooks/useFerramentas";
import { Wrench, Search } from "lucide-react";
import { FerramentaCard } from "@/components/bibliotecas/FerramentaCard";
import { FerramentaDetalhesModal } from "@/components/bibliotecas/FerramentaDetalhesModal";
import {
  FiltrosAvancadosSheet,
  FiltrosAvancados,
} from "@/components/bibliotecas/FiltrosAvancadosSheet";

export default function BibliotecaFerramentas() {
  const { data: ferramentas, isLoading } = useFerramentasIA();
  const [searchTerm, setSearchTerm] = useState("");
  const [ferramentaSelecionada, setFerramentaSelecionada] = useState<any>(null);
  const [filtrosAvancados, setFiltrosAvancados] = useState<FiltrosAvancados>({
    categoria: null,
    preco: "todas",
    valeAPena: "todas",
  });
  const [itemsToShow, setItemsToShow] = useState(10);

  const categorias = useMemo(
    () => (ferramentas ? Array.from(new Set(ferramentas.map((f) => f.categoria))) : []),
    [ferramentas]
  );

  const handleFiltrosChange = (novosFiltros: FiltrosAvancados) => {
    setFiltrosAvancados(novosFiltros);
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

  const visibleFerramentas = useMemo(() => {
    return filteredFerramentas?.slice(0, itemsToShow) || [];
  }, [filteredFerramentas, itemsToShow]);

  useEffect(() => {
    setItemsToShow(10);
  }, [searchTerm, filtrosAvancados]);

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

      {/* Contador de Resultados */}
      {filteredFerramentas && (
        <p className="text-sm text-muted-foreground">
          Mostrando {visibleFerramentas.length} de {filteredFerramentas.length}{" "}
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleFerramentas.map((ferramenta) => (
              <FerramentaCard 
                key={ferramenta.id} 
                ferramenta={ferramenta}
                onVerMais={() => setFerramentaSelecionada(ferramenta)}
              />
            ))}
          </div>

          {/* Botão Ver Mais */}
          {filteredFerramentas && visibleFerramentas.length < filteredFerramentas.length && (
            <div className="flex justify-center mt-8">
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

          {/* Modal de Detalhes */}
          <FerramentaDetalhesModal 
            ferramenta={ferramentaSelecionada}
            onClose={() => setFerramentaSelecionada(null)}
          />
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
  );
}
