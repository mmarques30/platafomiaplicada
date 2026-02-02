import { FileText, ExternalLink, Download, BookOpen, Lightbulb, Wrench, CheckSquare, Book, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useState } from "react";
import { MaterialGratuitoModal, type MaterialGratuito } from "@/components/comunidade/MaterialGratuitoModal";
import { downloadUrl, getFileNameFromUrl } from "@/lib/download";
import { toast } from "sonner";

const categoriaIconMap: Record<string, typeof FileText> = {
  templates: FileText,
  guias: BookOpen,
  prompts: Lightbulb,
  ferramentas: Wrench,
  checklists: CheckSquare,
  ebooks: Book,
  newsletter: Mail,
};

const getLinksUrls = (links_url: Json | null): string[] => {
  if (!links_url) return [];
  if (Array.isArray(links_url)) {
    return links_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

const getArquivoUrls = (arquivos_url: Json | null): string[] => {
  if (!arquivos_url) return [];
  if (Array.isArray(arquivos_url)) {
    return arquivos_url.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

export function MateriaisGratuitosTab() {
  const { logAccess } = useContentAccessLogger();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialGratuito | null>(null);
  
  const { data: materiais, isLoading } = useQuery({
    queryKey: ['materiais-gratuitos-comunidade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais_gratuitos')
        .select('*')
        .eq('ativo', true)
        .eq('visivel_gratuitos', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as MaterialGratuito[];
    },
  });

  const handleAccessClick = (material: MaterialGratuito) => {
    logAccess('material', material.id, material.titulo);
  };

  const safeDownload = async (url: string) => {
    try {
      await downloadUrl(url, getFileNameFromUrl(url));
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível baixar este arquivo. Abrindo em nova aba...");
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Título</TableHead>
                <TableHead className="w-[150px]">Categoria</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
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
      {!isLoading && materiais && materiais.length > 0 && (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] md:w-[400px]">Título</TableHead>
                <TableHead className="w-[150px]">Categoria</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TooltipProvider>
                {materiais.map((material) => {
                  const Icon = categoriaIconMap[material.categoria] || FileText;
                  const links = getLinksUrls(material.links_url);
                  const arquivos = getArquivoUrls(material.arquivos_url);
                  const primaryUrl = material.url || links[0];
                  const hasFiles = arquivos.length > 0;
                  const hasAnyContent = !!primaryUrl || hasFiles || !!material.descricao;
                  
                  return (
                    <TableRow
                      key={material.id}
                      className={cn(
                        hasAnyContent && "cursor-pointer hover:bg-accent/50",
                      )}
                      onClick={() => {
                        if (!hasAnyContent) return;
                        handleAccessClick(material);
                        setSelectedMaterial(material);
                      }}
                    >
                      <TableCell className="font-medium">{material.titulo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-sm capitalize">{material.categoria}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          {/* Link externo */}
                          {primaryUrl && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAccessClick(material);
                                    window.open(primaryUrl, "_blank", "noopener,noreferrer");
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Acessar material</p>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {/* Download primeiro arquivo (atalho) */}
                          {hasFiles && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAccessClick(material);
                                    void safeDownload(arquivos[0]);
                                  }}
                                >
                                  <Download className="h-4 w-4 text-primary" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Baixar arquivo</p>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {/* Empty state */}
                          {!primaryUrl && !hasFiles && (
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

      <MaterialGratuitoModal
        material={selectedMaterial}
        open={!!selectedMaterial}
        onOpenChange={(open) => !open && setSelectedMaterial(null)}
      />

      {/* Empty State */}
      {!isLoading && materiais && materiais.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum material disponível no momento.
          </p>
        </div>
      )}
    </div>
  );
}
