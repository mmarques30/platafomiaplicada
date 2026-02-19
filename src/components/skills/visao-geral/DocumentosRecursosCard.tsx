import { useState, useMemo } from "react";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import { useDocumentosSkills } from "@/hooks/admin/useDocumentosSkills";
import { useLinksSkills } from "@/hooks/admin/useLinksSkills";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Link2, ExternalLink, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecursoItem {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  data: string;
}

function getDocUrl(arquivoUrl: string | null): string {
  if (!arquivoUrl) return "#";
  const { data } = supabase.storage.from("documentos-skills").getPublicUrl(arquivoUrl);
  return data?.publicUrl ?? "#";
}

function getTipoLabel(tipo: string | null): string {
  if (!tipo) return "DOC";
  const upper = tipo.toUpperCase();
  if (upper.includes("PDF")) return "PDF";
  if (upper.includes("XLS") || upper.includes("PLANILHA")) return "XLS";
  if (upper.includes("PPT") || upper.includes("APRESENT")) return "PPT";
  return upper.slice(0, 4);
}

function RecursoRow({ item }: { item: RecursoItem }) {
  const isLink = item.tipo === "Link";
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => window.open(item.url, "_blank", "noopener")}
    >
      <TableCell className="w-16">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {isLink ? <Link2 className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
          {item.tipo}
        </span>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-1.5 text-sm text-foreground">
          {item.titulo}
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </span>
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(item.data), "dd/MM/yyyy", { locale: ptBR })}
      </TableCell>
    </TableRow>
  );
}

export default function DocumentosRecursosCard() {
  const { equipeId } = useSkillsMembro();
  const { documentos, isLoading: loadingDocs } = useDocumentosSkills(equipeId);
  const { links, isLoading: loadingLinks } = useLinksSkills(equipeId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const allItems = useMemo<RecursoItem[]>(() => {
    const docItems: RecursoItem[] = documentos.map((d) => ({
      id: d.id,
      tipo: getTipoLabel(d.tipo),
      titulo: d.titulo,
      url: getDocUrl(d.arquivo_url),
      data: d.created_at,
    }));
    const linkItems: RecursoItem[] = links.map((l) => ({
      id: l.id,
      tipo: "Link",
      titulo: l.titulo,
      url: l.url,
      data: l.created_at,
    }));
    return [...docItems, ...linkItems].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [documentos, links]);

  const preview = allItems.slice(0, 3);
  const isLoading = loadingDocs || loadingLinks;

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          Documentos e Recursos
        </CardTitle>
        {allItems.length > 3 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="text-xs px-0">
                Ver todos →
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Todos os Documentos e Recursos</DialogTitle>
              </DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allItems.map((item) => (
                    <RecursoRow key={item.id} item={item} />
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {allItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum documento disponível
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((item) => (
                  <RecursoRow key={item.id} item={item} />
                ))}
              </TableBody>
            </Table>
            {allItems.length > 3 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Mostrando 3 de {allItems.length}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
