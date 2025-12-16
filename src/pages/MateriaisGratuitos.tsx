import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, BookOpen, Lightbulb, Wrench, CheckSquare, Book, Mail, ArrowLeft, LayoutGrid, List, ExternalLink, Download, Code, Table as TableIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CopyButton } from "@/components/shared/CopyButton";
import { Json } from "@/integrations/supabase/types";

type Material = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  url: string;
  tipo: string;
  imagem_url: string | null;
  ordem: number;
  arquivos_url: Json | null;
  links_url: Json | null;
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

// Helper functions
const getFileName = (url: string): string => {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  return decodeURIComponent(fileName.split('?')[0]);
};

const getFileIcon = (url: string) => {
  const fileName = getFileName(url).toLowerCase();
  if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    return FileText;
  }
  if (fileName.endsWith('.csv') || fileName.endsWith('.xml') || fileName.endsWith('.xlsx')) {
    return TableIcon;
  }
  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return Code;
  }
  return FileText;
};

const getArquivoUrls = (arquivos_url: Json | null): string[] => {
  if (!arquivos_url) return [];
  if (Array.isArray(arquivos_url)) {
    return arquivos_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

const getLinksUrls = (links_url: Json | null): string[] => {
  if (!links_url) return [];
  if (Array.isArray(links_url)) {
    return links_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

export default function MateriaisGratuitos() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/comunidade")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Comunidade
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Materiais Gratuitos
        </h1>
        <p className="text-muted-foreground">
          Acesse templates, guias, prompts e recursos para aplicar IA no seu dia a dia
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between gap-4 mb-8">
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
                  const arquivos = getArquivoUrls(material.arquivos_url);
                  const links = getLinksUrls(material.links_url);
                  const allLinks = material.url ? [material.url, ...links] : links;
                  
                  return (
                    <Card key={material.id} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col h-full">
                      <CardHeader className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <Badge variant="outline">{categoria?.label}</Badge>
                        </div>
                        <CardTitle className="text-lg">{material.titulo}</CardTitle>
                        {material.descricao && (
                          <CardDescription className="text-sm line-clamp-2">
                            {material.descricao}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="mt-auto space-y-3">
                        {/* External links */}
                        {allLinks.length > 0 && (
                          <div className="space-y-2">
                            {allLinks.map((url, index) => (
                              <div key={index} className="flex gap-2">
                                <Button
                                  className="flex-1 h-10"
                                  variant={index === 0 ? "default" : "outline"}
                                  asChild
                                  onClick={() => handleAccessClick(material)}
                                >
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {allLinks.length > 1 ? `Link ${index + 1}` : 'Acessar'}
                                  </a>
                                </Button>
                                <CopyButton 
                                  content={url} 
                                  variant="outline" 
                                  size="default"
                                  className="h-10"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Download files section */}
                        {arquivos.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Arquivos para download:</p>
                            <div className="space-y-1.5">
                              {arquivos.map((url, index) => {
                                const FileIcon = getFileIcon(url);
                                const fileName = getFileName(url);
                                return (
                                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <FileIcon className="h-4 w-4 text-primary shrink-0" />
                                      <span className="text-sm truncate">{fileName}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 shrink-0" asChild>
                                      <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
                      <TableHead className="w-[250px]">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMateriais.map((material) => {
                      const categoria = CATEGORIAS.find((c) => c.value === material.categoria);
                      const Icon = categoria?.icon || FileText;
                      const arquivos = getArquivoUrls(material.arquivos_url);
                      const links = getLinksUrls(material.links_url);
                      const allLinks = material.url ? [material.url, ...links] : links;
                      
                      return (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.titulo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <span className="text-sm">{categoria?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {material.descricao || "—"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {allLinks.map((url, index) => (
                                <div key={index} className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant={index === 0 ? "default" : "outline"}
                                    asChild
                                    onClick={() => handleAccessClick(material)}
                                  >
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                      {allLinks.length > 1 ? `Link ${index + 1}` : 'Acessar'}
                                    </a>
                                  </Button>
                                  <CopyButton 
                                    content={url} 
                                    variant="outline" 
                                    size="sm"
                                  />
                                </div>
                              ))}
                              {arquivos.length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Download className="h-3 w-3 mr-1" />
                                      {arquivos.length} arquivo{arquivos.length > 1 ? 's' : ''}
                                      <ChevronDown className="h-3 w-3 ml-1" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-64">
                                    {arquivos.map((url, idx) => {
                                      const FileIcon = getFileIcon(url);
                                      const fileName = getFileName(url);
                                      return (
                                        <DropdownMenuItem key={idx} asChild>
                                          <a 
                                            href={url} 
                                            download={fileName}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 cursor-pointer"
                                          >
                                            <FileIcon className="h-4 w-4 shrink-0" />
                                            <span className="truncate flex-1">{fileName}</span>
                                            <Download className="h-3 w-3 shrink-0 text-muted-foreground" />
                                          </a>
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
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
    </div>
  );
}