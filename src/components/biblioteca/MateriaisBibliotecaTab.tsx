import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMateriaisComunidade } from "@/hooks/useMateriaisComunidade";
import { Search, FileText, Download, ExternalLink, Users } from "lucide-react";
import { AnimatedAvatarTooltip } from "@/components/comunidade/AnimatedAvatarTooltip";
import { cn } from "@/lib/utils";

const TIPOS = [
  { value: "all", label: "Todos os tipos" },
  { value: "prompt", label: "Prompt" },
  { value: "ferramenta", label: "Ferramenta" },
  { value: "documento", label: "Documento" },
  { value: "template", label: "Template" },
];

const CATEGORIAS = [
  { value: "all", label: "Todas as categorias" },
  { value: "produtividade", label: "Produtividade" },
  { value: "marketing", label: "Marketing" },
  { value: "vendas", label: "Vendas" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "design", label: "Design" },
  { value: "gestao", label: "Gestão" },
  { value: "outro", label: "Outro" },
];

export function MateriaisBibliotecaTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("all");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all");

  const { materiais, isLoading } = useMateriaisComunidade({
    tipo: selectedTipo !== "all" ? selectedTipo : undefined,
    categoria: selectedCategoria !== "all" ? selectedCategoria : undefined,
  });

  const filteredMateriais = useMemo(() => {
    if (!materiais) return [];
    return materiais.filter((material) =>
      material.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.descricao?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [materiais, searchTerm]);

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Dropdown de Tipo */}
        <Select value={selectedTipo} onValueChange={setSelectedTipo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dropdown de Categoria */}
        <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredMateriais.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMateriais.map((material) => (
            <Card
              key={material.id}
              className="p-4 flex flex-col min-h-[200px] hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">
                    {material.titulo}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className="text-xs capitalize">
                      {material.tipo}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {material.categoria}
                    </Badge>
                  </div>
                </div>
                
                {/* Avatar do criador */}
                {material.criador && (
                  <AnimatedAvatarTooltip
                    name={material.criador.nome_completo}
                    avatarUrl={material.criador.avatar_url}
                    size="sm"
                  />
                )}
              </div>

              {/* Descrição */}
              {material.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {material.descricao}
                </p>
              )}

              {/* Arquivos */}
              {material.arquivos_url && material.arquivos_url.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    {material.arquivos_url.slice(0, 3).map((url, idx) => {
                      const ext = getFileExtension(url);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleDownload(url)}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
                            "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          )}
                        >
                          <Download className="h-3 w-3" />
                          {ext.toUpperCase()}
                        </button>
                      );
                    })}
                    {material.arquivos_url.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{material.arquivos_url.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum material encontrado</p>
          </div>
        </Card>
      )}
    </div>
  );
}
