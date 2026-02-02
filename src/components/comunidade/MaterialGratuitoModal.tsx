import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { downloadUrl, getFileNameFromUrl } from "@/lib/download";
import { Json } from "@/integrations/supabase/types";

export type MaterialGratuito = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  url: string;
  tipo: string | null;
  arquivos_url: Json | null;
  links_url: Json | null;
};

const normalizeStringArray = (value: Json | null): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return [];
};

interface MaterialGratuitoModalProps {
  material: MaterialGratuito | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialGratuitoModal({ material, open, onOpenChange }: MaterialGratuitoModalProps) {
  const links = useMemo(() => {
    if (!material) return [];
    const arr = normalizeStringArray(material.links_url);
    const primary = material.url ? [material.url] : [];
    // evitar duplicados
    return Array.from(new Set([...primary, ...arr]));
  }, [material]);

  const arquivos = useMemo(() => {
    if (!material) return [];
    return normalizeStringArray(material.arquivos_url);
  }, [material]);

  const handleDownload = async (url: string) => {
    try {
      await downloadUrl(url, getFileNameFromUrl(url));
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível baixar este arquivo. Abrindo em nova aba...");
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              <FileText className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xl leading-tight break-words">{material.titulo}</span>
              <span className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{material.categoria}</Badge>
                {material.tipo && <Badge variant="outline">{material.tipo}</Badge>}
                {arquivos.length > 0 && (
                  <Badge variant="outline">{arquivos.length} arquivo{arquivos.length > 1 ? "s" : ""}</Badge>
                )}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
            {material.descricao && <p className="text-muted-foreground">{material.descricao}</p>}

            {/* Links */}
            {links.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Links</div>
                <div className="space-y-2">
                  {links.map((l) => (
                    <Button
                      key={l}
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => window.open(l, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{l}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {(links.length > 0 && arquivos.length > 0) && <Separator />}

            {/* Arquivos */}
            {arquivos.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Arquivos para baixar</div>
                <div className="space-y-2">
                  {arquivos.map((a) => (
                    <Button
                      key={a}
                      type="button"
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleDownload(a)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="truncate">{getFileNameFromUrl(a)}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
