import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useFerramentasIA } from "@/hooks/useFerramentas";
import { Wrench, Search } from "lucide-react";
import { FerramentasRanking } from "@/components/bibliotecas/FerramentasRanking";
import { FerramentaCardHorizontal } from "@/components/bibliotecas/FerramentaCardHorizontal";
import { FerramentaDetalhesModal } from "@/components/bibliotecas/FerramentaDetalhesModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/shared/PageTitle";
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
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Cabeçalho */}
      <div>
        <PageTitle primary="Biblioteca" secondary="de Ferramentas" />
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Catálogo completo de ferramentas de IA com avaliações especializadas
        </p>
      </div>

      {/* Ranking Top 3 */}
      {!isLoading && ferramentas && ferramentas.length > 0 && (
        <FerramentasRanking 
          ferramentas={ferramentas} 
          onVerMais={(f) => setFerramentaSelecionada(f)}
        />
      )}

      {/* Seção de Catálogo Completo */}
      <div className="space-y-4">

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ferramentas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro Categoria */}
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas Categorias</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro Preço */}
        <Select value={filtroPreco} onValueChange={setFiltroPreco}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="gratuitas">Gratuitas</SelectItem>
            <SelectItem value="pagas">Pagas</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro Vale a Pena */}
        <Select value={filtroValeAPena} onValueChange={setFiltroValeAPena}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Recomendação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="sim">Vale a Pena</SelectItem>
            <SelectItem value="nao">Não Recomendado</SelectItem>
          </SelectContent>
        </Select>
      </div>

        {/* Contador de Resultados */}
        {filteredFerramentas && (
          <p className="text-sm text-muted-foreground">
            Mostrando {visibleFerramentas.length} de {filteredFerramentas.length}{" "}
            {filteredFerramentas.length === 1 ? "ferramenta" : "ferramentas"}
          </p>
        )}

        {/* Conteúdo - Lista */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[140px]">
                <CardContent className="p-4 flex flex-col gap-3">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full mt-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFerramentas && filteredFerramentas.length > 0 ? (
          <>
            <div className="space-y-3">
              {visibleFerramentas.map((ferramenta) => (
                <FerramentaCardHorizontal
                  key={ferramenta.id}
                  ferramenta={ferramenta}
                  onVerMais={() => setFerramentaSelecionada(ferramenta)}
                />
              ))}
            </div>

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

      {/* Modal de Detalhes */}
      <FerramentaDetalhesModal
        ferramenta={ferramentaSelecionada}
        onClose={() => setFerramentaSelecionada(null)}
      />
    </div>
  );
}
