import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, BookOpen, Lightbulb, Wrench, CheckSquare, Book, Mail, ExternalLink, GraduationCap, Code, Table as TableIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Json } from "@/integrations/supabase/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  { value: "materiais_aula", label: "Materiais Aula", icon: GraduationCap },
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
    return { Icon: FileText, color: "text-red-500" };
  }
  if (fileName.endsWith('.csv') || fileName.endsWith('.xml') || fileName.endsWith('.xlsx')) {
    return { Icon: TableIcon, color: "text-green-600" };
  }
  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return { Icon: Code, color: "text-orange-500" };
  }
  return { Icon: FileText, color: "text-muted-foreground" };
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

  const handleAccessClick = (material: Material) => {
    logAccess('material', material.id, material.titulo);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-[120px]">Materiais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Materials Table View */}
      {!isLoading && filteredMateriais && filteredMateriais.length > 0 && (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] md:w-[400px]">Título</TableHead>
                <TableHead className="w-[120px] md:w-auto">Categoria</TableHead>
                <TableHead className="w-[120px]">Materiais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TooltipProvider>
                {filteredMateriais.map((material) => {
                  const categoria = CATEGORIAS.find((c) => c.value === material.categoria);
                  const CatIcon = categoria?.icon || FileText;
                  const arquivos = getArquivoUrls(material.arquivos_url);
                  const links = getLinksUrls(material.links_url);
                  const allLinks = material.url ? [material.url, ...links] : links;
                  
                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.titulo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CatIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm hidden md:inline">{categoria?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          {/* Links */}
                          {allLinks.map((url, index) => (
                            <Tooltip key={`link-${index}`}>
                              <TooltipTrigger asChild>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleAccessClick(material)}
                                  className={cn(
                                    "p-1.5 rounded-md hover:bg-primary/10 transition-colors",
                                    "text-primary hover:text-primary"
                                  )}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Acessar link</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                          
                          {/* Documents */}
                          {arquivos.map((url, idx) => {
                            const { Icon: FileIcon, color } = getFileIcon(url);
                            const fileName = getFileName(url);
                            return (
                              <Tooltip key={`file-${idx}`}>
                                <TooltipTrigger asChild>
                                  <a
                                    href={url}
                                    download={fileName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      "p-1.5 rounded-md hover:bg-muted transition-colors",
                                      color
                                    )}
                                  >
                                    <FileIcon className="h-4 w-4" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-[200px] truncate">{fileName}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}

                          {/* Empty state */}
                          {allLinks.length === 0 && arquivos.length === 0 && (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TooltipProvider>
            </TableBody>
          </Table>
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
