import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMetodos } from "@/hooks/useFerramentas";
import { Target, Search, Lightbulb, Cpu, FileText, ExternalLink, LayoutGrid, List } from "lucide-react";
import { METODOS_CATEGORIAS } from "@/lib/metodosCategories";

export default function MetodosAplicar() {
  const { data: metodos, isLoading } = useMetodos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredMetodos = metodos?.filter((metodo) => {
    const matchesSearch =
      metodo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metodo.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !selectedCategoria || metodo.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Métodos para Aplicar</h1>
        <p className="text-muted-foreground">
          Metodologias para alimentar a IA e obter resultados melhores
        </p>
      </div>

      {/* Filtros e Toggle de Visualização */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Busca */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar métodos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dropdown de Categoria */}
          <Select
            value={selectedCategoria || "todas"}
            onValueChange={(value) => setSelectedCategoria(value === "todas" ? null : value)}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas ({metodos?.length || 0})</SelectItem>
              {METODOS_CATEGORIAS.map((categoria) => {
                const count = metodos?.filter(m => m.categoria === categoria).length || 0;
                return (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Toggle de Visualização */}
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="h-8 w-8 p-0"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMetodos && filteredMetodos.length > 0 ? (
        viewMode === 'table' ? (
          /* Visualização em Tabela */
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="hidden lg:table-cell">Ferramentas</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetodos.map((metodo) => (
                  <TableRow key={metodo.id}>
                    <TableCell className="font-medium">{metodo.titulo}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">{metodo.categoria}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{metodo.descricao}</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {Array.isArray(metodo.ferramentas_recomendadas) && 
                          metodo.ferramentas_recomendadas.slice(0, 3).map((ferramenta: string) => (
                            <Badge key={ferramenta} variant="outline" className="text-xs">
                              {ferramenta}
                            </Badge>
                          ))}
                        {Array.isArray(metodo.ferramentas_recomendadas) && 
                          metodo.ferramentas_recomendadas.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{metodo.ferramentas_recomendadas.length - 3}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {metodo.link_documento && (
                          <Button asChild size="sm">
                            <a 
                              href={metodo.link_documento} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              Acessar
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        <FavoriteButton 
                          tipo="metodo" 
                          itemId={metodo.id}
                          variant="ghost"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Visualização em Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMetodos.map((metodo) => (
              <Card key={metodo.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{metodo.titulo}</CardTitle>
                      <Badge variant="secondary">{metodo.categoria}</Badge>
                    </div>
                    <FavoriteButton 
                      tipo="metodo" 
                      itemId={metodo.id}
                      variant="ghost"
                    />
                  </div>
                  <CardDescription className="mt-3">{metodo.descricao}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col gap-4">
                  {/* Botão Principal - Acessar Documento */}
                  {metodo.link_documento && (
                    <Button asChild className="w-full">
                      <a 
                        href={metodo.link_documento} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Acessar Documento
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}

                  {/* Comentários/Dicas de Uso */}
                  {metodo.comentarios && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Dicas de Uso
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {metodo.comentarios}
                      </p>
                    </div>
                  )}

                  {/* Ferramentas Recomendadas */}
                  {Array.isArray(metodo.ferramentas_recomendadas) && 
                   metodo.ferramentas_recomendadas.length > 0 && (
                    <div className="mt-auto pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Ferramentas onde aplicar:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {metodo.ferramentas_recomendadas.map((ferramenta: string) => (
                          <Badge 
                            key={ferramenta} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {ferramenta}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum método encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
