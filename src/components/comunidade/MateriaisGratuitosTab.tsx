import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, BookOpen, Lightbulb, Wrench, CheckSquare, Book, Mail, LayoutGrid, List, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CopyButton } from "@/components/shared/CopyButton";

type Material = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  url: string;
  tipo: string;
  imagem_url: string | null;
  ordem: number;
};

const CATEGORIAS = [
  { value: "templates", label: "Templates", icon: FileText },
  { value: "guias", label: "Guias", icon: BookOpen },
  { value: "prompts", label: "Prompts", icon: Lightbulb },
  { value: "ferramentas", label: "Ferramentas", icon: Wrench },
  { value: "checklists", label: "Checklists", icon: CheckSquare },
  { value: "ebooks", label: "E-books", icon: Book },
  { value: "newsletter", label: "Newsletter", icon: Mail },
];

export function MateriaisGratuitosTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { logAccess } = useContentAccessLogger();

  const { data: materiais, isLoading } = useQuery({
    queryKey: ["materiais-gratuitos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materiais_gratuitos")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as Material[];
    },
  });

  const filteredMateriais = selectedCategory
    ? materiais?.filter((m) => m.categoria === selectedCategory)
    : materiais;

  const groupedMateriais = CATEGORIAS.reduce((acc, cat) => {
    acc[cat.value] = materiais?.filter((m) => m.categoria === cat.value) || [];
    return acc;
  }, {} as Record<string, Material[]>);

  const handleAccessClick = (material: Material) => {
    logAccess('material', material.id, material.titulo);
  };

  return (
    <div className="space-y-6">
      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Filtrar por:</span>
          <Select 
            value={selectedCategory || "todas"} 
            onValueChange={(value) => setSelectedCategory(value === "todas" ? null : value)}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">
                Todas ({materiais?.length || 0})
              </SelectItem>
              {CATEGORIAS.map((cat) => {
                const count = groupedMateriais[cat.value]?.length || 0;
                return (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Materials View */}
      {!isLoading && filteredMateriais && filteredMateriais.length > 0 && (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMateriais.map((material) => {
                const categoria = CATEGORIAS.find((c) => c.value === material.categoria);
                const Icon = categoria?.icon || FileText;
                
                return (
                  <Card key={material.id} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col h-full">
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5 text-[#9EB038]" />
                        <Badge variant="outline">{categoria?.label}</Badge>
                      </div>
                      <CardTitle className="text-lg">{material.titulo}</CardTitle>
                      {material.descricao && (
                        <CardDescription className="text-sm line-clamp-2">
                          {material.descricao}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 h-10"
                          asChild
                          onClick={() => handleAccessClick(material)}
                        >
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Acessar
                          </a>
                        </Button>
                        <CopyButton 
                          content={material.url} 
                          variant="outline" 
                          size="default"
                          className="h-10"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[180px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMateriais.map((material) => {
                    const categoria = CATEGORIAS.find((c) => c.value === material.categoria);
                    const Icon = categoria?.icon || FileText;
                    
                    return (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.titulo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[#9EB038]" />
                            <span className="text-sm">{categoria?.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {material.descricao || "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              asChild
                              onClick={() => handleAccessClick(material)}
                            >
                              <a href={material.url} target="_blank" rel="noopener noreferrer">
                                Acessar
                              </a>
                            </Button>
                            <CopyButton 
                              content={material.url} 
                              variant="outline" 
                              size="sm"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredMateriais && filteredMateriais.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum material disponível nesta categoria no momento.
          </p>
        </div>
      )}
    </div>
  );
}