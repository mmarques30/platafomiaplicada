import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/shared/RatingStars";
import { useFerramentasIA } from "@/hooks/useFerramentas";
import { Wrench, Search, ExternalLink, CheckCircle, XCircle } from "lucide-react";

export default function BibliotecaFerramentas() {
  const { data: ferramentas, isLoading } = useFerramentasIA();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [showOnlyGratuitas, setShowOnlyGratuitas] = useState(false);

  const categorias = ferramentas
    ? Array.from(new Set(ferramentas.map((f) => f.categoria)))
    : [];

  const filteredFerramentas = ferramentas?.filter((ferramenta) => {
    const matchesSearch =
      ferramenta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ferramenta.objetivo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !selectedCategoria || ferramenta.categoria === selectedCategoria;
    const matchesGratuita = !showOnlyGratuitas || ferramenta.gratuito;
    return matchesSearch && matchesCategoria && matchesGratuita;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Wrench className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Ferramentas</h1>
          <p className="text-muted-foreground">
            Catálogo completo de ferramentas de IA com avaliações
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar ferramentas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showOnlyGratuitas ? "default" : "outline"}
          onClick={() => setShowOnlyGratuitas(!showOnlyGratuitas)}
        >
          Apenas Gratuitas
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <Badge
          variant={selectedCategoria === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategoria(null)}
        >
          Todas
        </Badge>
        {categorias.map((categoria) => (
          <Badge
            key={categoria}
            variant={selectedCategoria === categoria ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategoria(categoria)}
          >
            {categoria}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFerramentas && filteredFerramentas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFerramentas.map((ferramenta) => (
            <Card key={ferramenta.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{ferramenta.nome}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{ferramenta.categoria}</Badge>
                    {ferramenta.gratuito && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Gratuita
                      </Badge>
                    )}
                  </div>
                </div>
                {ferramenta.avaliacao && (
                  <RatingStars rating={ferramenta.avaliacao} />
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Objetivo:</h4>
                  <p className="text-sm text-muted-foreground">
                    {ferramenta.objetivo}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">O que entrega:</h4>
                  <p className="text-sm text-muted-foreground">
                    {ferramenta.o_que_entrega}
                  </p>
                </div>
                {ferramenta.vale_a_pena !== null && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-muted">
                    {ferramenta.vale_a_pena ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {ferramenta.vale_a_pena ? "Vale a pena!" : "Não vale a pena"}
                      </p>
                      {ferramenta.justificativa && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {ferramenta.justificativa}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {ferramenta.link_ferramenta && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(ferramenta.link_ferramenta!, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar Ferramenta
                  </Button>
                )}
              </CardContent>
            </Card>
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
