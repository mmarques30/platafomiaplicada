import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/CopyButton";
import { useIACopieUse } from "@/hooks/useFerramentas";
import { Sparkles, Search } from "lucide-react";

export default function IACopieUse() {
  const { data: ias, isLoading } = useIACopieUse();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  const categorias = ias
    ? Array.from(new Set(ias.map((ia) => ia.categoria)))
    : [];

  const filteredIAs = ias?.filter((ia) => {
    const matchesSearch = ia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ia.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || ia.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">IA "Copie e Use"</h1>
          <p className="text-muted-foreground">
            Ferramentas de IA prontas para você copiar e usar
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
        <div className="flex gap-2 flex-wrap">
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredIAs && filteredIAs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIAs.map((ia) => (
            <Card key={ia.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{ia.titulo}</CardTitle>
                    <CardDescription>{ia.descricao}</CardDescription>
                  </div>
                  <Badge variant="secondary">{ia.categoria}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ia.ia_recomendada && (
                  <div className="text-sm">
                    <span className="font-semibold">IA Recomendada:</span>{" "}
                    {ia.ia_recomendada}
                  </div>
                )}
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm break-all">{ia.conteudo}</code>
                </div>
                <CopyButton
                  content={ia.conteudo}
                  variant="default"
                  size="default"
                  className="w-full"
                />
              </CardContent>
            </Card>
          ))}
        </div>
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
    </div>
  );
}
