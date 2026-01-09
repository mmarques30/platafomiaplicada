import { FileText, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentAccessLogger } from "@/hooks/useContentAccessLogger";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConteudosDashboardGratuito } from "@/hooks/useConteudosDashboardGratuito";
import { ConteudoDashboard } from "@/hooks/useConteudosDashboard";

export function MateriaisGratuitosTab() {
  const { logAccess } = useContentAccessLogger();
  const { data: materiais, isLoading } = useConteudosDashboardGratuito('material');

  const handleAccessClick = (material: ConteudoDashboard) => {
    logAccess('material', material.id, material.titulo);
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
                <TableHead className="w-[120px]">Materiais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
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
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px] md:w-[400px]">Título</TableHead>
                <TableHead className="w-[120px]">Materiais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TooltipProvider>
                {materiais.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.titulo}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {/* Link externo */}
                        {material.link_externo && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={material.link_externo}
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
                              <p>Acessar material</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Empty state */}
                        {!material.link_externo && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TooltipProvider>
            </TableBody>
          </Table>
        </div>
      )}

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
