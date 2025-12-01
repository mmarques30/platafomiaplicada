import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ExternalLink, FileText, BookOpen, Lightbulb, Wrench, CheckSquare, Book, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";

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
  { value: "templates", label: "Templates", icon: FileText, color: "bg-blue-500" },
  { value: "guias", label: "Guias", icon: BookOpen, color: "bg-green-500" },
  { value: "prompts", label: "Prompts", icon: Lightbulb, color: "bg-yellow-500" },
  { value: "ferramentas", label: "Ferramentas", icon: Wrench, color: "bg-purple-500" },
  { value: "checklists", label: "Checklists", icon: CheckSquare, color: "bg-orange-500" },
  { value: "ebooks", label: "E-books", icon: Book, color: "bg-pink-500" },
  { value: "newsletter", label: "Newsletter", icon: Mail, color: "bg-red-500" },
];

export function MateriaisGratuitosTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      {/* Category Filter */}
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

      {/* Materials Grid */}
      {!isLoading && filteredMateriais && filteredMateriais.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMateriais.map((material) => {
            const categoria = CATEGORIAS.find((c) => c.value === material.categoria);
            const Icon = categoria?.icon || FileText;
            
            return (
              <Card key={material.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${categoria?.color || "bg-muted"}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <Badge variant="outline">{categoria?.label}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">{material.titulo}</CardTitle>
                  {material.descricao && (
                    <CardDescription className="text-sm">
                      {material.descricao}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => {
                      logAccess('material', material.id, material.titulo);
                      window.open(material.url, '_blank');
                    }}
                  >
                    {material.tipo === "download" ? (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Material
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar Material
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
